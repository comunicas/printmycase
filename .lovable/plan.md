

## Adicionar InitiateCheckout e AddToCart via CAPI Server-Side

### Contexto

Atualmente apenas o evento `Purchase` é enviado via CAPI (server-side). Os eventos `AddToCart` e `InitiateCheckout` são apenas browser-side (Pixel), o que reduz o match rate no Meta Events Manager. A solução é enviar esses eventos também via CAPI, com deduplicação por `event_id`.

### Estratégia

| Evento | Browser (Pixel) | Server (CAPI) | Ponto de disparo server-side |
|---|---|---|---|
| AddToCart | `useCustomize.tsx` | `meta-capi` via chamada direta do client | No momento do "Finalizar" (antes do upload) |
| InitiateCheckout | `Checkout.tsx` | `meta-capi` via `create-checkout` | Dentro da edge function, após criar a sessão Stripe |

### Alterações

**1. `src/lib/meta-pixel.ts`** — Adicionar suporte a `eventID` em `pixelEvent` para deduplicação genérica:
- `pixelEvent(name, params, eventId?)` passa `{ eventID: id }` ao `fbq`

**2. `supabase/functions/meta-capi/index.ts`** — Aceitar autenticação via JWT (além de CRON_SECRET):
- Verificar `Authorization: Bearer <token>` como alternativa ao `x-cron-secret`
- Permite chamadas autenticadas do client para AddToCart

**3. `src/hooks/useCustomize.tsx`** — No `handleFinalize`, gerar `event_id`, enviar Pixel com ele, e chamar `meta-capi` via `supabase.functions.invoke` com dados do evento AddToCart

**4. `supabase/functions/create-checkout/index.ts`** — Após criar a sessão Stripe e o pedido, disparar InitiateCheckout via `meta-capi` (mesmo padrão do Purchase no stripe-webhook):
- Usar o email do usuário (via claims) para hashing
- Enviar `event_id` gerado (já existe no código)
- Incluir `content_ids`, `value`, `currency`

**5. `src/pages/Checkout.tsx`** — Passar `event_id` no Pixel de InitiateCheckout para deduplicação com o CAPI que será enviado pelo `create-checkout`

**6. `src/pages/DesignPage.tsx`** — Mesmo tratamento: gerar `event_id` e enviá-lo ao `create-checkout` para CAPI do InitiateCheckout

### Fluxo de deduplicação

```text
AddToCart:
  Browser: pixelEvent("AddToCart", params, eventId)
  Server:  supabase.functions.invoke("meta-capi", { body: { event_name: "AddToCart", event_id: eventId, ... } })

InitiateCheckout:
  Browser: pixelEvent("InitiateCheckout", params, eventId)  ← Checkout.tsx gera eventId
  Server:  create-checkout chama meta-capi com mesmo eventId ← recebido via body do request
```

### Segurança do meta-capi

A edge function passará a aceitar dois modos de autenticação:
1. `x-cron-secret` (para chamadas internas entre edge functions)
2. `Authorization: Bearer <jwt>` (para chamadas do client, validando via `getClaims`)

Isso evita criar uma nova edge function e mantém centralizado.

