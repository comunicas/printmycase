

# Fase 2: Eliminação de Legados e Consolidação

## 1. Mover tipos e `formatPrice` de `src/data/products.ts` para `src/lib/types.ts`

- Criar `src/lib/types.ts` com as interfaces `Product`, `ProductColor`, `ProductSpec` e a função `formatPrice`
- Unificar `DbProduct` (de `Admin.tsx`) com `Product` — são praticamente idênticos, a diferença é que `DbProduct` tem `active: boolean` (não nullable) e campos `any[]` para specs/colors. Usaremos uma única interface `Product` com `active: boolean` (non-null)
- Atualizar **11 arquivos** que importam de `@/data/products` para importar de `@/lib/types`
- Remover `src/data/products.ts`
- Remover a interface `DbProduct` de `Admin.tsx` e importar `Product` de `@/lib/types`

## 2. Criar `src/lib/constants.ts` com `statusLabels` unificado

- Extrair `statusLabels` e `statusColors` (usados em `Admin.tsx` e `notify-order-status`)
- Incluir o `statusFlow` com ícones (usado em `Orders.tsx`) — ou manter separado pois depende de Lucide (client-only)
- `Admin.tsx` e `Orders.tsx` importarão de `@/lib/constants.ts`
- A edge function `notify-order-status` continuará com sua cópia local (edge functions não podem importar de `src/`)

## 3. Extrair componente `LoadingSpinner`

- Criar `src/components/ui/loading-spinner.tsx` com duas variantes:
  - `fullPage`: spinner centralizado em tela cheia (`min-h-screen`)
  - `inline`: spinner centralizado em container (`py-12`)
- Substituir os **10 spinners duplicados** em: `Customize.tsx`, `Catalog.tsx`, `AdminGuard.tsx`, `Admin.tsx`, `Product.tsx`, `AuthGuard.tsx`, `Landing.tsx`, `Checkout.tsx`, `ProductsTable.tsx`, `Orders.tsx`

## 4. Otimizar `resolveProductInfo`

- Substituir as 2 queries paralelas (by slug + by id) por uma única query usando `.or()`:
  ```
  .or(`slug.in.(${slugs}),id.in.(${uuids})`)
  ```

## Arquivos afetados

| Ação | Arquivo |
|------|---------|
| Criar | `src/lib/types.ts` |
| Criar | `src/lib/constants.ts` |
| Criar | `src/components/ui/loading-spinner.tsx` |
| Deletar | `src/data/products.ts` |
| Editar | `src/pages/Admin.tsx` — remover `DbProduct`, importar de types/constants |
| Editar | `src/pages/Orders.tsx` — importar constants, usar LoadingSpinner |
| Editar | `src/pages/Catalog.tsx`, `Product.tsx`, `Checkout.tsx`, `CheckoutSuccess.tsx`, `Customize.tsx`, `Landing.tsx` — imports + spinner |
| Editar | `src/components/ProductCard.tsx`, `ProductDetails.tsx`, `ProductInfo.tsx`, `SeoHead.tsx` — imports |
| Editar | `src/components/checkout/OrderSummary.tsx`, `AddressForm.tsx` — imports |
| Editar | `src/components/AdminGuard.tsx`, `AuthGuard.tsx`, `admin/ProductsTable.tsx` — spinner |
| Editar | `src/hooks/useProducts.ts` — import Product |
| Editar | `src/lib/products.ts` — otimizar query |

