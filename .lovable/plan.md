

## API de Conversões do Meta (Server-Side)

A Conversions API (CAPI) envia eventos diretamente do servidor para o Meta, complementando o Pixel do navegador. Isso melhora a precisão do rastreamento (especialmente com bloqueadores de anúncios e ITP do Safari).

### Pré-requisito: Token de Acesso

Você precisará de um **Meta Access Token** gerado no Meta Business Manager:
1. Acesse **Events Manager → Settings → Conversions API**
2. Gere um token de acesso permanente
3. Eu solicitarei que você o insira como segredo do projeto

### Alterações

| Arquivo | Mudança |
|---|---|
| **Segredo** `META_ACCESS_TOKEN` | Novo segredo a ser configurado |
| `supabase/functions/meta-capi/index.ts` | **Nova** edge function genérica para enviar eventos ao endpoint `graph.facebook.com/v21.0/{PIXEL_ID}/events` |
| `supabase/functions/stripe-webhook/index.ts` | Após confirmar pagamento, chamar `meta-capi` internamente para enviar evento `Purchase` server-side com `event_id` para deduplicação |
| `src/lib/meta-pixel.ts` | Gerar `event_id` único por evento e passá-lo tanto ao `fbq()` (browser) quanto ao servidor, permitindo deduplicação automática pelo Meta |
| `src/pages/CheckoutSuccess.tsx` | Enviar `event_id` junto com o evento Purchase do Pixel para que o Meta deduplicar com o evento server-side |

### Arquitetura

```text
Navegador (Pixel)                     Servidor (CAPI)
─────────────────                     ───────────────
fbq('Purchase', {event_id: X})  ──┐
                                  ├──▶ Meta deduplica por event_id
stripe-webhook ──▶ meta-capi ────┘
  (Purchase server-side, event_id: X)
```

### Evento Purchase server-side (mais importante)

O `stripe-webhook` já processa `checkout.session.completed`. Após atualizar o pedido, ele chamará a edge function `meta-capi` com:
- `event_name`: "Purchase"
- `event_time`: timestamp Unix
- `user_data`: email hasheado (SHA-256) do perfil do usuário
- `custom_data`: `{ currency: "BRL", value: total/100 }`
- `event_id`: gerado no momento da criação do checkout e salvo no metadata do Stripe session

### Edge function `meta-capi`

- Recebe eventos via POST com `event_name`, `event_time`, `user_data`, `custom_data`, `event_id`, `event_source_url`
- Envia para `https://graph.facebook.com/v21.0/1617415106170829/events`
- Usa `META_ACCESS_TOKEN` dos segredos
- Pixel ID hardcoded (já público no index.html)
- `verify_jwt = false` (chamada interna do stripe-webhook)
- Autenticação via `CRON_SECRET` para chamadas internas

### Deduplicação

O Meta usa `event_id` para deduplicar eventos idênticos enviados pelo Pixel (browser) e pela CAPI (servidor). O `event_id` será gerado no `create-checkout` e armazenado no metadata da session Stripe, garantindo que o mesmo ID seja usado em ambos os canais.

### Detalhes técnicos

- Hash SHA-256 do email do usuário conforme exigido pela API do Meta
- `action_source`: "website" para todos os eventos
- O token de acesso nunca é exposto ao cliente
- Erros na CAPI são logados mas não bloqueiam o fluxo principal do webhook

