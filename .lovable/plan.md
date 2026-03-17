

## Revisão de Eventos Meta Pixel + CAPI e Documentação

### Problemas Identificados

1. **Função `pixelEventWithId` nunca é usada** — foi criada mas nenhum evento a utiliza; é redundante com `pixelTrackPurchase`
2. **Eventos sem `content_ids`** — ViewContent e AddToCart não enviam `content_ids` (product ID), prejudicando atribuição no Meta
3. **Sem `content_type`** — eventos de catálogo não informam `content_type: "product"`, exigido para melhor match
4. **ARCHITECTURE.md desatualizado** — não menciona Meta Pixel, CAPI, Clarity, nem várias edge functions recentes (`meta-capi`, `generate-gallery-image`, `upscale-image`, `create-coin-checkout`, `cleanup-pending-checkouts`)
5. **Tabelas faltando na documentação** — `coin_transactions`, `coin_settings`, `referrals`, `collections`, `collection_designs`, `product_gallery_images`, `ai_generated_images`, `legal_documents`, `kb_categories`, `kb_articles`, `pending_checkouts`

### Alterações Planejadas

| Arquivo | Mudança |
|---|---|
| `src/lib/meta-pixel.ts` | Remover `pixelEventWithId` (não usada). Simplificar para 2 funções: `pixelEvent` (sem dedup) e `pixelTrackPurchase` (com dedup). Manter `generateEventId`. |
| `src/pages/Product.tsx` | Adicionar `content_ids: [product.id]` e `content_type: "product"` ao ViewContent |
| `src/hooks/useCustomize.tsx` | Adicionar `content_ids: [product.id]` e `content_type: "product"` ao AddToCart |
| `src/pages/Checkout.tsx` | Adicionar `content_ids: [product.id]` e `content_type: "product"` ao InitiateCheckout |
| `ARCHITECTURE.md` | Atualizar seções: edge functions (adicionar 6 faltantes), tabelas (adicionar 11 faltantes), analytics (nova seção para Pixel + CAPI + Clarity), rotas (adicionar collections, coins, knowledge base, legal) |

### Detalhes da Otimização de Eventos

Eventos atuais e suas correções:

| Evento | Onde dispara | Correção |
|---|---|---|
| `PageView` | index.html (automático) | Nenhuma — correto |
| `ViewContent` | Product.tsx | Adicionar `content_ids`, `content_type` |
| `AddToCart` | useCustomize.tsx | Adicionar `content_ids`, `content_type` |
| `InitiateCheckout` | Checkout.tsx | Adicionar `content_ids`, `content_type` |
| `Purchase` | CheckoutSuccess.tsx (browser) + stripe-webhook (CAPI) | Já correto com deduplicação via `event_id` |
| `CompleteRegistration` | Signup.tsx + LoginDialog.tsx | Correto — são caminhos distintos de cadastro |

### Não há duplicidade real

- Cada evento dispara em um único ponto do funil (exceto CompleteRegistration que cobre 2 formulários de signup distintos — correto)
- Purchase é o único com CAPI server-side, corretamente deduplicado
- `pixelEventWithId` será removida por ser dead code

