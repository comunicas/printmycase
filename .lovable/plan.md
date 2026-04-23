
Objetivo revisado: validar o que realmente aconteceu no último cadastro, separar o que está funcionando do que está inconsistente, e fechar um plano de correção do fluxo de emails em cima de evidências do código e dos logs atuais.

## Diagnóstico do último usuário cadastrado

### O que os logs mostram
Último cadastro identificado:
- email: `suporte@printmycase.com.br`
- evento de signup: `2026-04-23T04:43:45Z`
- o hook de email foi executado com sucesso no cadastro
- depois houve `GET /verify` com `303` em `2026-04-23T04:44:18Z`
- em seguida houve login bem-sucedido

Leitura prática:
- o fluxo de autenticação do último usuário não aparenta estar quebrado do ponto de vista do cadastro
- houve solicitação de confirmação e depois verificação bem-sucedida
- não apareceu erro explícito de auth no backend para esse usuário

### O que está inconsistente
Mesmo com o hook de auth executado com sucesso:
- não apareceram registros recentes de auth em `email_send_log` para `signup`, `recovery`, `magiclink`, etc.
- também não apareceram logs recentes úteis de execução de `auth-email-hook` ou `send-transactional-email`

Conclusão:
- o signup do último usuário aparentemente funcionou
- mas a observabilidade do fluxo de auth está inconsistente com o código atual
- hoje não dá para afirmar com segurança se:
  - o email foi enviado pela implementação nova via Resend e não foi logado
  - ou o fluxo real em produção/teste ainda está passando por um caminho diferente do esperado

## Checklist do estado atual do plano

### 1) Fluxo de auth email
- [x] Existe `auth-email-hook`
- [x] O hook foi chamado com sucesso no último signup
- [x] O último usuário conseguiu verificar a conta
- [ ] O envio de auth está observável no `email_send_log`
- [ ] Há confirmação clara de que o código implantado corresponde exatamente ao código atual do repositório

Status:
- funcional do ponto de vista do usuário
- parcial do ponto de vista técnico e de rastreabilidade

### 2) Fluxo de emails transacionais
- [x] Existe sender central via `send-transactional-email`
- [x] `submit-contact` usa o sender central
- [x] `notify-order-status` usa o sender central
- [x] Templates de contato e status estão registrados
- [ ] Ainda falta validar envios reais recentes após a migração

Status:
- estrutura principal pronta
- falta validação operacional final

### 3) Integração Resend
- [x] Existe helper compartilhado `_shared/resend.ts`
- [x] A integração usa gateway do connector
- [x] `RESEND_API_KEY` e `LOVABLE_API_KEY` já existem
- [ ] O remetente ainda está em `onboarding@resend.dev`
- [ ] Ainda não está fechado o uso de domínio/remetente final verificado no Resend

Status:
- integração conectada
- branding/remetente de produção ainda incompleto

### 4) Infra antiga
- [x] `process-email-queue` segue no projeto como legado
- [x] `ARCHITECTURE.md` já menciona a fila como legado
- [ ] Ainda existem resíduos do fluxo antigo na operação e na documentação
- [ ] Ainda há histórico de falhas antigas em `email_send_log`

Status:
- convivência entre legado e fluxo novo ainda não foi totalmente limpa

## Bugs e riscos reais encontrados

### Bug 1 — imports de `@supabase/supabase-js` ainda estão flutuando em funções de email
Arquivos afetados:
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/submit-contact/index.ts`

Problema:
- esses arquivos ainda usam `npm:@supabase/supabase-js@2`
- o projeto já teve erro real de bundling por resolução de dependência em edge functions
- manter versão flutuante aqui reabre risco de deploy inconsistente

Correção recomendada:
- fixar a mesma versão já padronizada nas outras functions: `npm:@supabase/supabase-js@2.49.8`

### Bug 2 — remetente padrão continua em modo de teste
Arquivo:
- `supabase/functions/_shared/resend.ts`

Problema:
- `DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'`
- isso é aceitável para smoke test, mas não para operação final da marca
- o fluxo “migrou para Resend”, mas ainda não está finalizado como remetente de produção

Correção recomendada:
- trocar para o remetente/domínio já verificado no Resend
- centralizar isso em constante única para auth e transacional

### Bug 3 — parsing frágil da resposta do gateway do Resend
Arquivo:
- `supabase/functions/_shared/resend.ts`

Problema:
- `JSON.parse(responseText)` é chamado sem proteção
- se o gateway responder com corpo vazio, HTML, texto simples ou erro não-JSON, o código explode com erro secundário
- isso mascara a causa real do problema

Correção recomendada:
- fazer parse defensivo
- preservar status HTTP + corpo bruto quando a resposta não for JSON

### Bug 4 — lacuna de observabilidade no fluxo de auth
Arquivos/áreas:
- `auth-email-hook`
- `email_send_log`
- implantação/logs do hook

Problema:
- os logs de auth mostram que o hook rodou
- mas não existem registros recentes de `signup`/`recovery` no `email_send_log`
- isso indica divergência entre fluxo real e telemetria esperada

Correção recomendada:
- revisar o código implantado do `auth-email-hook`
- confirmar se a versão em produção/teste é a nova
- garantir que o hook sempre grave `pending/sent/failed` com `message_id`, `run_id` e `provider_message_id`

### Bug 5 — documentação ainda não fechou a migração
Arquivo:
- `ARCHITECTURE.md`

Problema:
- a documentação já aponta Resend e fila legada, mas ainda não deixa totalmente explícito:
  - qual fluxo está ativo
  - qual fluxo é só legado
  - quais verificações operacionais devem ser usadas
- isso dificulta manutenção futura

Correção recomendada:
- consolidar a arquitetura final “ativa”
- marcar worker/fila antigos como compatibilidade/remoção futura

## Comentário técnico sobre o último signup
O último usuário cadastrado não indica bug funcional de cadastro/confirmacão.
O bug principal encontrado nesta revisão não está no signup em si, e sim em:
- rastreabilidade incompleta do auth email
- endurecimento insuficiente da integração Resend
- restos de acoplamento e inconsistência entre código, logs e operação real

## Plano refatorado de correção

### Etapa 1 — Corrigir a base técnica do sender Resend
1. Fixar `@supabase/supabase-js@2.49.8` em todas as functions de email ainda pendentes
2. Tornar `_shared/resend.ts` resiliente a respostas não-JSON
3. Preparar o helper para armazenar o `id` retornado pelo Resend quando existir
4. Padronizar o remetente em uma configuração única

Resultado esperado:
- deploy mais estável
- erros mais diagnósticos
- base pronta para auditoria real

### Etapa 2 — Fechar a observabilidade do auth-email-hook
1. Revisar o hook para garantir gravação consistente em `email_send_log`
2. Incluir em `metadata`:
   - `provider: resend`
   - `run_id`
   - `provider_message_id`
   - `email_type`
3. Confirmar que o caminho de auth em uso é realmente este hook

Resultado esperado:
- cada signup/recovery passa a ter rastreio confiável

### Etapa 3 — Validar transacional após migração
1. Testar `submit-contact`
2. Testar `notify-order-status`
3. Confirmar `pending -> sent` no log
4. Registrar `provider_message_id` também no transacional

Resultado esperado:
- contato e status do pedido com ciclo completo verificável

### Etapa 4 — Encerrar a limpeza do legado
1. Revisar `process-email-queue` como legado explícito
2. Identificar se ainda existe algum chamador real da fila antiga
3. Limpar documentação residual
4. Decidir se a função legada fica apenas para histórico/rollback ou se será aposentada depois

Resultado esperado:
- uma arquitetura principal só
- menos confusão operacional

## O que falta para finalizar o plano de emails
Para considerar a migração realmente concluída, estes pontos ainda precisam ficar verdadeiros:

- [ ] sender final do Resend configurado com domínio/remetente de produção
- [ ] auth emails com log consistente no `email_send_log`
- [ ] transacionais com log consistente no `email_send_log`
- [ ] helper do Resend endurecido contra respostas inválidas
- [ ] imports pinados nas functions de email
- [ ] documentação final consolidada
- [ ] legado explicitamente desativado ou claramente isolado

## Ordem recomendada de implementação
1. endurecer `_shared/resend.ts`
2. pinar dependências das functions de email
3. revisar e redeployar `auth-email-hook`
4. revisar e redeployar `send-transactional-email`
5. validar um signup novo
6. validar contato
7. validar status de pedido
8. atualizar documentação final

## Detalhes técnicos
Arquivos mais críticos desta revisão:
- `supabase/functions/_shared/resend.ts`
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/submit-contact/index.ts`
- `supabase/functions/notify-order-status/index.ts`
- `ARCHITECTURE.md`

Evidências principais usadas nesta revisão:
- logs de auth do último signup mostram sucesso no hook e verificação posterior
- consulta recente em `email_send_log` não mostra entradas de auth recentes
- `DEFAULT_FROM_EMAIL` ainda está em `onboarding@resend.dev`
- imports de `supabase-js` nas functions de email ainda estão em versão flutuante
