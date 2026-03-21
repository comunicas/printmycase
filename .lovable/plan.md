

## Implementar emails transacionais no fluxo Stripe + corrigir notify-order-status

### Contexto
- `notify-order-status` usa envio direto (`sendLovableEmail`) em vez da fila de emails (`enqueue_email`), perdendo retry/rate-limit
- Sender domain está como `printmycase.com.br` mas o domínio configurado é `notify.printmycase.com.br`
- `stripe-webhook` não envia nenhum email (confirmação de compra ou cancelamento)
- Frontend engole erros com `.catch(() => {})`

### Alterações

**1. `supabase/functions/notify-order-status/index.ts` — Migrar para fila de emails**
- Trocar `sendLovableEmail` por `supabaseAdmin.rpc('enqueue_email', ...)` para usar a fila com retry
- Atualizar `SENDER_DOMAIN` para `notify.printmycase.com.br`
- Atualizar `FROM` para `PrintMyCase <noreply@notify.printmycase.com.br>`
- Adicionar logs estruturados: `[notify] Start`, `[notify] Enqueued`, `[notify] Error`
- Manter toda a lógica de auth/admin e template HTML existente

**2. `supabase/functions/stripe-webhook/index.ts` — Adicionar emails de confirmação e cancelamento**
- Após `checkout.session.completed` para compra de case (não moedas): buscar dados do usuário/produto e enfileirar email "Pedido Confirmado — Em Análise"
- Após `checkout.session.expired`: enfileirar email "Pedido Cancelado"
- Reutilizar o mesmo template HTML do `notify-order-status` (copiar a função `buildEmailHtml`)
- Usar `supabaseAdmin.rpc('enqueue_email', ...)` para enfileirar
- Envio é non-blocking (try/catch com log, não impede o 200 do webhook)

**3. `src/components/admin/OrdersManager.tsx` — Remover catch silencioso**
- Trocar `.catch(() => {})` por `.catch((err) => console.warn("[notify] email error:", err))`
- Nas linhas 84-86 e 102-104

### Template de email reutilizado
O mesmo `buildEmailHtml` será extraído para uma função compartilhada inline em ambas as functions (edge functions não podem compartilhar imports facilmente entre si, então duplicamos a função helper).

### Emails resultantes

| Evento | Subject | Trigger |
|--------|---------|---------|
| Pagamento confirmado | "Pedido #XXXX — Confirmado ✓" | `stripe-webhook` |
| Admin muda status | "Pedido #XXXX — {Status}" | `notify-order-status` |
| Session expirada | "Pedido #XXXX — Cancelado" | `stripe-webhook` |

### Arquivos modificados
1. `supabase/functions/notify-order-status/index.ts`
2. `supabase/functions/stripe-webhook/index.ts`
3. `src/components/admin/OrdersManager.tsx`

Deploy necessário: `notify-order-status` e `stripe-webhook`

