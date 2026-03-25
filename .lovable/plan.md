## Sistema de Emails — Refatoração Completa ✅

### Infraestrutura

- Filas pgmq (`auth_emails`, `transactional_emails`) + cron job a cada 5s
- Tabelas: `email_send_log`, `email_send_state`, `suppressed_emails`, `email_unsubscribe_tokens`
- RPCs: `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`

### Edge Functions

| Função | Descrição |
|--------|-----------|
| `auth-email-hook` | Webhook de auth → renderiza templates React Email → enfileira em `auth_emails` |
| `send-transactional-email` | Entrada única para emails transacionais → verifica supressão → gera token unsubscribe → enfileira |
| `process-email-queue` | Dispatcher (cron) → drena filas → retry/rate-limit/DLQ |
| `preview-transactional-email` | Preview de templates transacionais (API interna) |
| `handle-email-unsubscribe` | API JSON para validação e processamento de unsubscribe |
| `handle-email-suppression` | Webhook para bounces/complaints do provedor |
| `notify-order-status` | Admin: busca dados do pedido → chama `send-transactional-email` com template `order-status-update` |

### Templates de Autenticação (PT-BR + branding)

Todos com logo PrintMyCase, cor primária `hsl(265, 83%, 57%)`, border-radius `24px`, fonte Inter:
- `signup.tsx` — Confirme sua conta
- `recovery.tsx` — Redefinir senha
- `magic-link.tsx` — Acesse sua conta
- `invite.tsx` — Convite
- `email-change.tsx` — Confirme a troca de email
- `reauthentication.tsx` — Código de verificação

### Templates Transacionais

- `order-status-update.tsx` — Status do pedido (badge colorido, dados, rastreio, botão "Ver Meus Pedidos")

### DNS Pendente

| Tipo | Nome | Valor |
|------|------|-------|
| NS | notify | `ns3.lovable.cloud` |
| NS | notify | `ns4.lovable.cloud` |

Estes registros devem ser adicionados no provedor DNS de `printmycase.com.br`.
