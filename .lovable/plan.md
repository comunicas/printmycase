## Email de Carrinho Abandonado

Disparar automaticamente um email para o usuário que iniciou uma customização (registro em `pending_checkouts`) mas não finalizou a compra, incentivando-o a voltar e concluir.

### Regras de envio

- **Sequência de 3 lembretes** por checkout pendente:
  - 1º: ~1 hora após `updated_at`
  - 2º: ~24 horas após `updated_at`
  - 3º: ~72 horas após `updated_at` (último)
- Não enviar se o usuário já comprou aquele `product_id` depois do `updated_at` (verifica `orders` com `status != 'pending'`).
- Não enviar se o `pending_checkout` foi removido (significa compra concluída ou descartado).
- Idempotência via `email_send_log.message_id` no formato `abandoned-cart-{checkout_id}-{step}`, evitando duplicidade.
- Respeita `suppressed_emails` (já tratado pelo sender).

### Mudanças técnicas

1. **Nova tabela auxiliar** `pending_checkouts` já tem o que precisamos; nenhuma coluna nova. Controle de envio fica via `email_send_log` (message_id).

2. **Novo template transacional** `abandoned-cart-reminder.tsx` em `supabase/functions/_shared/transactional-email-templates/`:
   - Props: `userName`, `productName`, `productImageUrl`, `resumeUrl`, `step` (1|2|3) — assunto varia por step ("Você esqueceu algo especial 🎨", "Sua arte ainda está aqui", "Última chance de finalizar seu case").
   - CTA "Continuar minha customização" → link para `/customize/{product-slug}` (rascunho já é restaurado pelo `useCustomizeDraft`).
   - Visual alinhado ao layout dos outros templates (logo PrintMyCase, paleta roxa).
   - Registrado em `registry.ts`.

3. **Nova Edge Function** `send-abandoned-cart-reminders`:
   - Protegida por `x-cron-secret` (mesmo padrão da `cleanup-pending-checkouts`).
   - Para cada step (1h/24h/72h):
     - Busca `pending_checkouts` cujo `updated_at` caia na janela do step.
     - Para cada item: valida que não existe pedido pago/posterior, busca email do usuário (auth.admin) e nome do produto (`products`), monta `resumeUrl`, e invoca `send-transactional-email` com `idempotencyKey = abandoned-cart-{id}-{step}`.
   - Configurada com `verify_jwt = false` em `supabase/config.toml`.

4. **Cron job** rodando a cada 30 minutos, chamando a function com header `x-cron-secret`.

### Comunicação ao usuário

- Apenas 3 emails máximo por carrinho, espaçados, com unsubscribe automático no rodapé (gerenciado pela infra).
- Caracteriza-se como transacional: cada envio é disparado pela ação específica daquele usuário (ele iniciou um carrinho).

### Arquivos afetados

- `supabase/functions/_shared/transactional-email-templates/abandoned-cart-reminder.tsx` (novo)
- `supabase/functions/_shared/transactional-email-templates/registry.ts` (registrar)
- `supabase/functions/send-abandoned-cart-reminders/index.ts` (novo)
- `supabase/config.toml` (verify_jwt=false na nova function)
- Migração SQL para criar o cron job de 30 em 30 min

### Fora de escopo

- Painel admin para visualizar envios (pode ser feito depois consultando `email_send_log` filtrando por `template_name = 'abandoned-cart-reminder'`).
- Personalização A/B de assunto/copy.
