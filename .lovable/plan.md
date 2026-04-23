
Objetivo: fazer os emails de signup/recovery voltarem ao layout e remetente corretos da PrintMyCase e garantir que o `coin-purchase-confirmation` seja disparado somente após crédito confirmado, deixando rastros `pending/sent` no `email_send_log`.

## Diagnóstico consolidado

### Auth emails
A imagem mostra que o usuário está recebendo o template padrão do sistema:
- remetente: `no-reply@auth.lovable.cloud`
- assunto/copy em inglês
- layout genérico, diferente do branding já existente no projeto

A revisão do projeto confirma o desvio:
- `supabase/functions/_shared/email-templates/signup.tsx` e `recovery.tsx` já estão customizados em PT-BR e com branding PrintMyCase
- porém não há registros recentes de `signup`/`recovery` no `email_send_log`
- também não há logs recentes do `auth-email-hook`
- o domínio de envio `notify.printmycase.com.br` está com status pendente

Conclusão:
- os emails de auth não estão saindo pelo hook/template customizado do projeto
- por isso o usuário recebe o fallback padrão
- sem o hook ativo na trilha real, também não há gravação no `email_send_log`

### Coin purchase email
O código já tenta disparar `coin-purchase-confirmation` em dois pontos:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/verify-coin-purchase/index.ts`

Mas a validação atual ainda é insuficiente para garantir fechamento operacional:
- não há registros de `coin-purchase-confirmation` no `email_send_log`
- o envio está duplicado em dois fluxos de crédito possíveis
- falta consolidar a regra “disparar após crédito efetivo” em um único caminho confiável e auditável

## O que será implementado

### 1) Reativar corretamente os emails customizados de auth
- Reconciliar o fluxo de auth email para que `signup` e `recovery` usem o `auth-email-hook` ativo do projeto
- Reaplicar/confirmar os templates customizados existentes
- Garantir que o hook esteja de fato publicando os eventos no fluxo real de envio
- Validar que os emails deixem de usar o fallback `auth.lovable.cloud`

### 2) Ajustar o visual/copy dos templates de signup e recovery
- Manter o visual alinhado ao branding atual:
  - logo PrintMyCase
  - português
  - CTA com cor primária do app
  - tipografia/interações consistentes com os templates transacionais já existentes
- Revisar espaçamento/largura para evitar aparência “genérica” no cliente de email
- Confirmar consistência entre `signup.tsx` e `recovery.tsx`

### 3) Corrigir a trilha de observabilidade dos auth emails
- Garantir que `signup` e `recovery` gravem:
  - `pending`
  - `sent` ou `failed`
  - `provider_message_id`
- Confirmar isso no `email_send_log` após o hook voltar a ser o caminho efetivo de envio

### 4) Consolidar o disparo do coin purchase após crédito confirmado
- Centralizar a lógica para que o `coin-purchase-confirmation` seja disparado apenas depois de `coin_transactions` ser gravado com sucesso
- Definir uma única fonte de verdade para o disparo, evitando ambiguidade entre:
  - `stripe-webhook`
  - `verify-coin-purchase`
- Preservar idempotência por `stripe_session_id`
- Manter o `messageId/idempotencyKey` baseado em `coin-purchase-${sessionId}`

### 5) Garantir gravação de `sent` para coin purchase
- Validar que o caminho final use o sender central já existente
- Confirmar que o `send-transactional-email` seja efetivamente invocado no cenário real de crédito
- Garantir que a execução resulte em registros no `email_send_log` com:
  - `template_name = coin-purchase-confirmation`
  - `pending`
  - `sent`
  - `provider_message_id`

## Ajustes técnicos previstos

### Arquivos de auth
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/_shared/email-templates/signup.tsx`
- `supabase/functions/_shared/email-templates/recovery.tsx`

### Arquivos de coins
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/verify-coin-purchase/index.ts`
- possivelmente um helper compartilhado para evitar duplicação do disparo

### Validação de catálogo
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `supabase/functions/send-transactional-email/index.ts`

## Observação importante de infraestrutura
Hoje o domínio de envio está pendente. Sem a conclusão dessa ativação, os emails de autenticação podem continuar caindo no fallback padrão, mesmo com o código ajustado. Portanto o fechamento completo depende de dois itens juntos:
- correção do caminho técnico de auth no projeto
- ativação final do domínio de envio no backend de emails

## Critérios de aceite
A tarefa pode ser fechada quando houver evidência de que:

### Auth
- `signup` chega com visual PrintMyCase, em PT-BR
- `recovery` chega com visual PrintMyCase, em PT-BR
- o remetente deixa de aparecer como `no-reply@auth.lovable.cloud`
- ambos registram `pending` + `sent` no `email_send_log`

### Coins
- após crédito confirmado de moedas, `coin-purchase-confirmation` é disparado
- o envio ocorre uma única vez por sessão de compra
- há registros `pending` + `sent` em `email_send_log`
- `provider_message_id` fica persistido

## Resultado esperado
- signup/recovery deixam de usar o template fallback e passam a usar o branding real da PrintMyCase
- o fluxo de moedas fica auditável de ponta a ponta
- o `email_send_log` passa a refletir corretamente tanto auth quanto compra de moedas
