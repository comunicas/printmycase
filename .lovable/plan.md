

## Corrigir erros de banco de dados no checkout

### Problema
Os logs revelam **dois erros** que impedem o checkout de funcionar completamente:

1. **`create-checkout`**: `Could not find the 'public_success_nonce' column of 'orders'` — A coluna `public_success_nonce` não existe na tabela `orders`, impedindo a inserção do pedido após criar a sessão Stripe.

2. **`stripe-webhook`**: `Could not find the table 'public.stripe_webhook_events'` — A tabela de idempotência do webhook não existe, causando falha em todos os webhooks do Stripe (pagamento confirmado, etc).

### Solução
Uma única migração SQL para:

1. **Adicionar coluna `public_success_nonce`** na tabela `orders` (tipo `text`, nullable)
2. **Criar tabela `stripe_webhook_events`** com:
   - `id` (uuid, PK)
   - `event_id` (text, unique — para deduplicação)
   - `event_type` (text)
   - `stripe_session_id` (text, nullable)
   - `payload` (jsonb)
   - `created_at` (timestamptz)
3. **RLS** na tabela `stripe_webhook_events`: sem acesso público (apenas service role insere via edge function)

### Detalhes técnicos
- A coluna `public_success_nonce` é usada pelo `get-success-order` para validar tokens de sucesso sem autenticação
- A tabela `stripe_webhook_events` implementa idempotência — o constraint unique em `event_id` previne processamento duplicado (código já trata erro `23505`)
- Nenhuma alteração de código necessária — apenas schema do banco

