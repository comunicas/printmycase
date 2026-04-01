

## Limpar Mensagens Presas + Corrigir Causa Raiz

### Situação atual

| msg_id | read_ct | Assunto | Erro |
|--------|---------|---------|------|
| 1 | 16.752 | Pedido #30ab — Em Análise | missing idempotency_key |
| 2 | 16.342 | Pedido #cef7 — Cancelado | missing idempotency_key |
| 3 | 16.341 | Pedido #f4d6 — Cancelado | missing idempotency_key |
| 4 | 16.338 | Pedido #4cbb — Cancelado | missing idempotency_key |
| 5 | 15.179 | Pedido #a4bc — Cancelado | missing idempotency_key |

Todas sem `message_id`, então a lógica de retry/DLQ do `process-email-queue` não as move — ficam presas eternamente.

### Plano

**1. Limpar as 5 mensagens presas (migração SQL)**

Chamar `pgmq.delete` para cada `msg_id` de 1 a 5 na fila `transactional_emails`.

**2. Corrigir `stripe-webhook/index.ts` — adicionar `idempotency_key` e `message_id`**

O webhook do Stripe enfileira emails via `enqueue_email` com HTML inline mas sem `idempotency_key`, `message_id` ou `purpose`. Corrigir para incluir:
- `idempotency_key`: baseado no `order_id` + tipo (ex: `order-confirmed-{order_id}`)
- `message_id`: UUID gerado
- `purpose: "transactional"`

**3. Corrigir `process-email-queue` — proteção contra `message_id` nulo**

Adicionar fallback: se `message_id` for nulo, usar `read_ct` como contador de tentativas e mover para DLQ após `MAX_RETRIES`. Isso evita que mensagens sem `message_id` fiquem presas novamente.

**4. Deploy das edge functions atualizadas**

### Resultado
- 5 mensagens presas removidas imediatamente
- Novos emails do Stripe terão identificação correta
- Sistema resiliente contra mensagens sem `message_id`

