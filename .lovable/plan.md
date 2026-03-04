

# Extrair OrderSummary em componente separado

## Novo arquivo: `src/components/checkout/OrderSummary.tsx`

Criar componente que recebe `productPriceCents`, `shippingCents` e `shipping` (nullable) como props e renderiza o bloco de resumo do pedido (linhas 172-190 do Checkout).

## Mudanças em `src/pages/Checkout.tsx`

- Importar `OrderSummary`
- Substituir o bloco JSX do resumo (linhas 171-190) por `<OrderSummary productPriceCents={productPriceCents} shippingCents={shippingCents} hasShipping={!!shipping} />`
- Remover import de `Truck` (usado apenas no resumo)

