
Objetivo refatorado: abandonar a infraestrutura atual de envio e migrar para Resend com o menor risco possível, preservando apenas os gatilhos de negócio já existentes.

## Diagnóstico do estado atual
- O projeto hoje está acoplado à infraestrutura nativa de emails em vários pontos:
  - emails de autenticação
  - sender central de app emails
  - fila/processador
  - unsubscribe e suppression
  - logs de envio
- O domínio `notify.printmycase.com.br` ainda está pendente nessa infraestrutura atual.
- Isso importa porque, se o mesmo subdomínio for reaproveitado no Resend, pode haver conflito de DNS.
- Hoje o contato e o status de pedido já dependem do sender central atual.
- Não há conexão Resend já disponível no workspace neste momento, então a integração por connector ainda precisará ser criada antes da implementação.

## Melhor caminho recomendado
Melhor caminho: usar Resend em um subdomínio separado do fluxo atual.

Recomendação prática:
- manter o domínio atual fora da migração imediata
- configurar o Resend em um subdomínio dedicado, por exemplo:
  - `mail.printmycase.com.br`, ou
  - `notify2.printmycase.com.br`
- só usar `notify.printmycase.com.br` no Resend se você realmente quiser aposentar o arranjo atual e remover a delegação DNS anterior no provedor de domínio

Por que esse caminho é melhor:
- reduz risco de conflito DNS
- evita ficar bloqueado pela configuração pendente atual
- permite migração gradual
- facilita rollback

## Resposta direta às suas perguntas

### 1) “Preciso fazer algo lá?”
Sim, provavelmente no painel do Resend e no provedor DNS do domínio.

Se for usar um subdomínio novo no Resend:
- adicionar o domínio/subdomínio no Resend
- copiar os registros DNS que o Resend pedir
- publicar esses registros no seu provedor DNS
- aguardar validação no Resend

Se quiser usar exatamente `notify.printmycase.com.br`:
- antes precisa desligar o uso atual desse subdomínio na infraestrutura antiga
- depois remover no provedor DNS qualquer delegação/NS antiga desse subdomínio
- só então validar esse mesmo subdomínio no Resend

### 2) “Você conecta via API no Resend?”
Sim, o plano refatorado é integrar o backend com a API do Resend.
Como você escolheu usar connector, o fluxo ideal é:
- conectar a conta Resend ao projeto
- usar essa conexão no backend para enviar os emails
- substituir os pontos atuais de envio por chamadas ao Resend

## O que muda no plano original
O plano anterior partia da premissa de estabilizar a infraestrutura atual.
Isso deixa de ser o melhor caminho se a decisão é usar Resend.

Portanto:
- sai a etapa de “destravar domínio atual”
- sai a etapa de “estabilizar fila atual como base definitiva”
- entra a etapa de “desacoplar gatilhos do provedor atual”
- entra a etapa de “validar DNS e envio real no Resend”
- a fila/logs/unsubscribe atuais passam a ser reavaliados: ou são removidos da responsabilidade de envio, ou ficam apenas como legado temporário durante a transição

## Plano refatorado para Resend

### Etapa 1 — Decisão de domínio de envio
Definir uma das duas estratégias:

Opção A — recomendada
- usar novo subdomínio no Resend

Opção B — mais arriscada
- reaproveitar `notify.printmycase.com.br`
- exige desmontar a configuração anterior antes

Resultado esperado
- domínio de envio da nova arquitetura definido sem ambiguidade

### Etapa 2 — Habilitar acesso ao Resend no projeto
- criar/vincular a conexão Resend no projeto
- confirmar que o backend consegue autenticar no Resend
- padronizar a estratégia de envio por connector

Resultado esperado
- projeto apto a falar com a API do Resend

### Etapa 3 — Desenhar a nova arquitetura mínima
Substituir a infraestrutura atual de envio por uma arquitetura mais simples:
- auth emails via Resend
- app emails via Resend
- manter templates React/HTML onde fizer sentido
- remover dependência operacional da fila atual para os fluxos principais

Resultado esperado
- definição clara do que será mantido, adaptado ou aposentado

### Etapa 4 — Migrar primeiro os app emails
Ordem segura:
1. contato
2. status de pedido

Por quê:
- são fluxos controlados e fáceis de validar
- geram menos risco que auth

Resultado esperado
- contato e pedidos enviando por Resend sem depender do sender atual

### Etapa 5 — Migrar os auth emails
- revisar hook atual de auth
- substituir o mecanismo de entrega para Resend
- validar:
  - confirmação de conta
  - recuperação de senha
  - magic link
  - troca de email
  - reauthentication

Resultado esperado
- autenticação inteira usando Resend com branding consistente

### Etapa 6 — Revisar unsubscribe/suppression/logs
Aqui há uma decisão de arquitetura:
- manter tabelas locais apenas como auditoria interna, ou
- simplificar e deixar o Resend concentrar a telemetria principal

Recomendação:
- manter logs mínimos locais só para rastreabilidade dos fluxos críticos
- não tentar replicar toda a complexidade atual se ela não for necessária

Resultado esperado
- observabilidade suficiente sem reimplementar uma infraestrutura pesada

### Etapa 7 — Limpeza da infraestrutura antiga
Depois que tudo estiver validado:
- remover acoplamentos ao sender atual
- remover dependência do processador de fila atual
- revisar documentação
- deixar claro quais funções ainda existem por compatibilidade e quais saem de operação

Resultado esperado
- arquitetura final coerente, sem dois provedores “meio ativos”

## Checklist de migração segura

### Pode começar agora
- [x] decisão de trocar de provedor foi tomada
- [x] já existem gatilhos principais mapeados
- [x] contato e status de pedido já estão identificados no código

### Falta antes de implementar
- [ ] escolher se o Resend usará subdomínio novo ou o `notify.printmycase.com.br`
- [ ] conectar o Resend ao projeto
- [ ] confirmar o domínio validado no Resend
- [ ] definir como tratar auth emails na nova arquitetura

### Falta para concluir de fato
- [ ] migrar contato para Resend
- [ ] migrar status de pedido para Resend
- [ ] migrar auth emails para Resend
- [ ] validar envios reais ponta a ponta
- [ ] revisar documentação
- [ ] desativar dependência operacional do fluxo antigo

## Recomendação final
O melhor caminho não é “consertar primeiro a estrutura atual”.
O melhor caminho, dado seu objetivo, é:

1. configurar Resend em um subdomínio novo
2. integrar o projeto ao Resend
3. migrar primeiro contato e status de pedido
4. migrar auth emails depois
5. só no final aposentar a infraestrutura atual

Isso reduz risco, evita conflito DNS e acelera a entrada em produção.

## Detalhes técnicos
Arquivos mais impactados no plano refatorado:
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/process-email-queue/index.ts`
- `supabase/functions/submit-contact/index.ts`
- `supabase/functions/notify-order-status/index.ts`
- `supabase/functions/handle-email-unsubscribe/index.ts`
- `supabase/functions/handle-email-suppression/index.ts`
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `ARCHITECTURE.md`

Pontos de atenção:
- o subdomínio `notify.printmycase.com.br` está pendente na estrutura atual
- não há conexão Resend disponível ainda no projeto
- se o mesmo subdomínio for reutilizado, será necessário ajustar DNS no provedor antes da validação no Resend
