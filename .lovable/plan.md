

## Instalar Meta Pixel (ID: 1617415106170829)

Pixel ID recebido. Vou seguir o mesmo padrão do Clarity já existente.

### Alterações

| Arquivo | Mudança |
|---|---|
| `index.html` | Adicionar script base do Meta Pixel + noscript fallback no `<head>`, logo após o Clarity |
| `src/lib/meta-pixel.ts` | **Novo** — helper tipado com `pixelEvent()` e `pixelTrackPurchase()` |
| `src/pages/Product.tsx` | Disparar `ViewContent` com nome, valor e currency ao visualizar produto |
| `src/hooks/useCustomize.tsx` | Disparar `AddToCart` no `handleContinue` (quando avança pro checkout) |
| `src/pages/Checkout.tsx` | Disparar `InitiateCheckout` ao montar a página |
| `src/pages/CheckoutSuccess.tsx` | Disparar `Purchase` com valor total em BRL quando o pedido é carregado |

### Eventos

| Rota | Evento Meta | Parâmetros |
|---|---|---|
| Todas | `PageView` | Automático (script base) |
| `/product/:slug` | `ViewContent` | `content_name`, `value`, `currency: 'BRL'` |
| `/customize/:slug` → Finalizar | `AddToCart` | `content_name`, `value`, `currency: 'BRL'` |
| `/checkout/:slug` | `InitiateCheckout` | `value`, `currency: 'BRL'` |
| `/checkout/success` | `Purchase` | `value`, `currency: 'BRL'`, `content_ids` |

### Detalhes técnicos

- O script base no `index.html` carrega o SDK do Facebook e dispara `PageView` automaticamente em cada navegação
- O helper `src/lib/meta-pixel.ts` encapsula `window.fbq` com type safety, evitando erros se o pixel não carregar
- Cada evento é adicionado com 1-2 linhas nos pontos exatos onde o Clarity já rastreia, sem alterar lógica existente

