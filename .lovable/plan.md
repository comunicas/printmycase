
Objetivo revisado: fechar o escopo completo de emails do produto com uma matriz única de fluxos, cobrindo autenticação, onboarding, moedas e compra, além de consolidar o que já existe, o que falta implementar e quais validações precisam ser feitas para considerar a entrega concluída.

## Escopo final de emails

### 1) Autenticação / cadastro
Emails necessários:
- Confirmação de cadastro
- Recuperação de senha
- Magic link
- Troca de email
- Reautenticação / código
- Convite, se o fluxo continuar ativo

Estado atual no código:
- Já existem templates e envio centralizado para:
  - `signup`
  - `invite`
  - `magiclink`
  - `recovery`
  - `email_change`
  - `reauthentication`
- Já passam pelo `auth-email-hook`
- Já usam o remetente central
- Já gravam em `email_send_log`

Ajustes planejados:
- Fortalecer observabilidade do `auth-email-hook` para não ignorar falha de gravação no log
- Validar em produção pelo menos:
  - `signup`
  - `recovery`

### 2) Bem-vindo
Email necessário:
- Boas-vindas após confirmação/cadastro concluído

Estado atual:
- Não existe template de boas-vindas
- Não há gatilho explícito para esse envio

Implementação planejada:
- Criar template transacional `welcome-email`
- Definir disparo idempotente após cadastro efetivamente concluído
- Preferir gatilho baseado em usuário já criado/ativo, evitando disparo antes da confirmação de email
- Registrar no `email_send_log` como qualquer outro email transacional

### 3) Coins / uso de moedas
Emails necessários:
- Compra de moedas confirmada
- Crédito de moedas concluído
- Consumo de moedas em filtros IA: avaliar como comunicação operacional, não por padrão um email por uso
- Alerta/resumo de saldo baixo: opcional, não obrigatório nesta fase

Estado atual:
- Compra de moedas existe no backend
- Crédito de moedas existe via webhook/validação
- Não existe email de confirmação de compra de moedas
- Não existe email de uso de moedas

Decisão de produto recomendada:
- Implementar agora apenas os emails realmente necessários:
  - confirmação de compra de moedas
  - confirmação de crédito recebido
- Não implementar email por cada uso de coins em filtro/upscale nesta etapa
  - motivo: alto ruído, baixo valor, risco de excesso de envio
- Se desejado depois, tratar “uso de coins” como resumo periódico ou evento excepcional, não como email por ação

Implementação planejada:
- Criar template transacional `coin-purchase-confirmation`
- Disparar após crédito efetivo e idempotente das moedas
- Incluir:
  - quantidade comprada
  - saldo/validade quando aplicável
  - referência da compra
  - CTA para usar moedas em IA

### 4) Compra de case / pedido
Emails necessários:
- Pedido recebido / pagamento confirmado
- Atualizações de status do pedido
- Cancelamento por expiração/falha relevante
- Envio com rastreio
- Entrega concluída
- Recusa de imagem, quando aplicável

Estado atual:
- Já existe template `order-status-update`
- Já existe envio em:
  - `stripe-webhook`
  - `notify-order-status`
- Já cobre parte dos estados:
  - analyzing / confirmação operacional do pedido
  - cancelled
  - shipped
  - delivered
  - rejected
  - demais atualizações via status

Ajustes planejados:
- Consolidar formalmente a matriz de mensagens por status
- Garantir consistência de assunto, conteúdo e idempotência
- Validar que o email de compra inicial represente claramente:
  - pedido recebido
  - pagamento confirmado
  - próximos passos
- Confirmar se `paid` continuará visível ao cliente ou se `analyzing` será o primeiro status comunicado

## Matriz final recomendada

### Auth
- `signup` — obrigatório
- `recovery` — obrigatório
- `magiclink` — obrigatório se o fluxo estiver habilitado
- `email_change` — obrigatório
- `reauthentication` — obrigatório
- `invite` — opcional conforme uso real

### App emails
- `welcome-email` — novo, obrigatório
- `contact-confirmation` — já existe
- `contact-notification` — já existe
- `coin-purchase-confirmation` — novo, obrigatório
- `order-status-update` — já existe e será consolidado como email principal de pedido

## Implementação proposta

### Etapa 1 — Auditoria e consolidação do catálogo
- Mapear oficialmente todos os emails ativos e seus gatilhos
- Separar auth vs emails do app
- Documentar a matriz final em `ARCHITECTURE.md`

### Etapa 2 — Corrigir observabilidade do auth
- Ajustar `auth-email-hook` para checar erro em inserts de `pending`, `sent` e `failed`
- Garantir log estruturado no console quando a trilha falhar
- Confirmar que `provider_message_id` continua sendo persistido

### Etapa 3 — Criar novos templates necessários
- Criar `welcome-email`
- Criar `coin-purchase-confirmation`
- Registrar ambos no registry transacional
- Manter visual e branding iguais ao padrão existente

### Etapa 4 — Ligar os gatilhos corretos
- Bem-vindo:
  - disparar somente após o cadastro estar realmente concluído
  - com idempotência por usuário
- Compra de moedas:
  - disparar após crédito efetivo das moedas
  - com idempotência por sessão/compra
- Pedido:
  - revisar gatilhos já existentes e remover ambiguidades entre “pedido confirmado” e “mudança de status”

### Etapa 5 — Validar em produção
Validar com evidência em `email_send_log`:
- signup
- recovery
- welcome-email
- coin-purchase-confirmation
- order-status-update para pelo menos:
  - confirmação inicial
  - shipped com rastreio
  - delivered ou cancelled

## Critérios de aceite

A tarefa estará fechada quando:
- o remetente final estiver consistente em todos os fluxos
- auth emails críticos estiverem validados em produção
- existir email de boas-vindas funcionando
- existir email de compra de moedas funcionando
- fluxo de compra de case estiver coberto do recebimento às atualizações de status
- `email_send_log` registrar corretamente `pending` e `sent/failed` com `provider_message_id` quando disponível
- a documentação refletir a matriz final de emails

## Detalhes técnicos
Arquivos centrais envolvidos:
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `supabase/functions/_shared/transactional-email-templates/*`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/verify-coin-purchase/index.ts`
- `supabase/functions/notify-order-status/index.ts`
- `ARCHITECTURE.md`

Bugs/gaps identificados nesta revisão:
- `auth-email-hook` ainda não valida explicitamente erro das gravações no `email_send_log`
- não existe email de boas-vindas
- não existe email de compra/crédito de moedas
- “uso de coins” ainda não deve virar email por ação nesta fase; o fluxo necessário é compra/crédito, não ruído operacional

Resultado final esperado:
- stack de emails completa e coerente para cadastro, onboarding, moedas e compra
- menor risco operacional
- rastreabilidade completa
- cobertura funcional dos emails realmente necessários do produto
