

## Instalação do Meta Pixel para Rastreio de Conversões

### Abordagem

Seguir o mesmo padrão já usado com o Microsoft Clarity: script base no `index.html` + helper TypeScript para eventos + tracking em pontos-chave do funil.

### Pré-requisito

Você precisará informar o **Pixel ID** da sua conta Meta (encontrado no Meta Events Manager). Ele será inserido diretamente no código (é uma chave pública, não precisa de secret).

### Alterações

| Arquivo | Mudança |
|---|---|
| `index.html` | Adicionar o script base do Meta Pixel (`fbq('init', ...)` + `PageView`) no `<head>`, ao lado do Clarity |
| `src/lib/meta-pixel.ts` | Novo helper com funções tipadas: `pixelEvent(name, params?)` e `pixelTrackPurchase(value, currency)` |
| `src/hooks/useClarityFunnel.ts` | Renomear ou estender para disparar eventos Meta Pixel nas mesmas rotas do funil (ou criar `useMetaPixelFunnel.ts` separado) |
| `src/pages/CheckoutSuccess.tsx` | Disparar `fbq('track', 'Purchase', { value, currency: 'BRL' })` quando o pedido é carregado |
| `src/pages/Product.tsx` | Disparar `ViewContent` com dados do produto |
| `src/pages/Checkout.tsx` | Disparar `InitiateCheckout` |
| `src/pages/Customize.tsx` | Disparar `AddToCart` quando o usuário avança para checkout |

### Eventos mapeados

```text
Landing/Catalog  →  PageView (automático)
/product/:slug   →  ViewContent  (name, value, currency)
/customize/:slug →  AddToCart     (ao clicar "Finalizar")
/checkout/:slug  →  InitiateCheckout
/checkout/success→  Purchase      (value, currency, content_ids)
```

### Estrutura do helper

```typescript
// src/lib/meta-pixel.ts
export function pixelEvent(name: string, params?: Record<string, unknown>) { ... }
export function pixelTrackPurchase(valueBRL: number, contentId?: string) { ... }
```

### Próximo passo

Preciso do seu **Pixel ID** (ex: `123456789012345`) para inserir no script. Você pode encontrá-lo em **Meta Events Manager → Fontes de Dados → seu Pixel → ID**.

