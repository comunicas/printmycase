

## Verificação do Webhook Stripe Live

### O que o código espera

O arquivo `supabase/functions/stripe-webhook/index.ts` processa dois eventos:
1. **`checkout.session.completed`** — atualiza pedido para "analyzing" e credita coins bônus
2. **`checkout.session.expired`** — cancela o pedido

### Como verificar (manual no Stripe Dashboard)

Não é possível listar webhooks programaticamente pelas ferramentas disponíveis. Você precisa verificar no **Stripe Dashboard**:

1. Acesse: **Developers → Webhooks** (em modo Live, não Test)
2. Confirme que existe um endpoint apontando para:
   ```
   https://gfsbsgwxylvhnwbpcodj.supabase.co/functions/v1/stripe-webhook
   ```
3. Confirme que os eventos selecionados incluem:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Confirme que o **Signing Secret** desse endpoint corresponde ao valor configurado como `STRIPE_WEBHOOK_SECRET`

### Status atual dos segredos
- `STRIPE_SECRET_KEY` ✅ configurado
- `STRIPE_WEBHOOK_SECRET` ✅ configurado

### Evidência de funcionamento
Os logs mostram que o webhook **já processou com sucesso** um evento recente:
> `Credited 30 bonus coins to 8ade2db7-...` (timestamp: poucos minutos atrás)

Isso confirma que o webhook está recebendo eventos `checkout.session.completed` e processando corretamente.

### Conclusão
O webhook **já está funcionando em produção**. A única verificação pendente é confirmar no Stripe Dashboard que `checkout.session.expired` também está na lista de eventos — mas o fluxo principal de compra está operacional.

