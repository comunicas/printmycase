

## Correção robusta: Crédito de moedas + fallback pós-pagamento

### Diagnóstico

**O webhook Stripe NÃO está recebendo eventos.** Os logs da function `stripe-webhook` estão completamente vazios (nenhum `checkout.session.completed` processado). Evidências:
- Nenhuma transação `coin_purchase` na tabela `coin_transactions`
- Nenhuma transação `purchase_bonus` (bônus pós-compra de case também não creditou)
- O pedido está em status `delivered` (mudado manualmente pelo admin), mas deveria ter passado por `analyzing` via webhook
- A function está deployada e responde (testamos e recebeu "Missing signature" corretamente)

**Causa provável**: O webhook no painel do Stripe não está apontando para a URL correta (`https://iqnqpwnbdqzvqssxcxgb.supabase.co/functions/v1/stripe-webhook`), ou o `STRIPE_WEBHOOK_SECRET` não corresponde ao endpoint configurado.

### Plano de correção

**1. Verificação imediata do webhook (manual)**
- Você precisa verificar no painel do Stripe se o webhook endpoint está configurado para `https://iqnqpwnbdqzvqssxcxgb.supabase.co/functions/v1/stripe-webhook`
- Se não estiver, criar/atualizar o endpoint com os eventos `checkout.session.completed` e `checkout.session.expired`
- Copiar o Signing Secret do webhook e atualizar o secret `STRIPE_WEBHOOK_SECRET` se necessário

**2. Fallback no frontend: verificação pós-pagamento para moedas** (`src/pages/Coins.tsx`)
- Quando o usuário retorna com `?purchased=X`, chamar uma nova edge function `verify-coin-purchase` que:
  - Recebe o `session_id` do Stripe (adicionado à success_url)
  - Verifica no Stripe se a session foi paga (`session.payment_status === 'paid'`)
  - Verifica se já existe transação `coin_purchase` para esse `session_id` (idempotência)
  - Se pago e não creditado → insere `coin_transaction` e retorna sucesso
  - Se já creditado → retorna sucesso sem duplicar

**3. Nova edge function `verify-coin-purchase`** (`supabase/functions/verify-coin-purchase/index.ts`)
- Autenticada (JWT do usuário)
- Recebe `{ sessionId: string }`
- Usa Stripe SDK para buscar a session e validar:
  - `payment_status === 'paid'`
  - `metadata.type === 'coin_purchase'`
  - `metadata.user_id` === usuário autenticado
- Verifica idempotência: busca `coin_transactions` com `description LIKE '%session_id%'` ou adiciona coluna `stripe_session_id`
- Se não creditado → insere transação

**4. Coluna de idempotência** (`coin_transactions`)
- Migração: `ALTER TABLE coin_transactions ADD COLUMN stripe_session_id text;`
- Unique constraint parcial: `CREATE UNIQUE INDEX idx_coin_tx_stripe_session ON coin_transactions(stripe_session_id) WHERE stripe_session_id IS NOT NULL;`
- Webhook e verify-function usam essa coluna para evitar crédito duplo

**5. Atualizar `create-coin-checkout`** 
- Adicionar `session_id` na success_url: `/coins?purchased={coins}&session_id={CHECKOUT_SESSION_ID}`

**6. Atualizar `stripe-webhook`**
- Inserir `stripe_session_id` na transação de moedas para idempotência

**7. Creditar manualmente a compra que ficou sem crédito**
- Inserir 50 moedas para o usuário `ea5c41e2-c588-4ca5-8c8d-bd24ed014bf2` via insert tool

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/verify-coin-purchase/index.ts` | **Novo** — verificação pós-pagamento |
| `supabase/functions/create-coin-checkout/index.ts` | Adicionar `session_id` na success_url |
| `supabase/functions/stripe-webhook/index.ts` | Adicionar `stripe_session_id` no insert |
| `src/pages/Coins.tsx` | Chamar verify-coin-purchase no retorno do pagamento |
| Migração SQL | Adicionar coluna `stripe_session_id` + unique index |

### Fluxo resultante
```text
Pagamento → Stripe checkout → [webhook credita moedas]
                             ↓
                        Usuário volta para /coins?purchased=50&session_id=cs_xxx
                             ↓
                        Frontend chama verify-coin-purchase
                             ↓
                        Se webhook não creditou → credita agora (idempotente)
                        Se já creditou → ignora (unique constraint)
```

