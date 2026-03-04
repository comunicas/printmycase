

# Ajuste na página de confirmação: imagem e nome do produto

## Problema
A página de confirmação (`CheckoutSuccess.tsx`) busca o produto apenas por `slug` (linha 39), mas o `product_id` armazenado no pedido é um UUID. Isso faz com que o fallback exiba o UUID cru (visível no screenshot). Além disso, não exibe a imagem do produto.

## Mudanças em `src/pages/CheckoutSuccess.tsx`

1. **Buscar produto por UUID e slug**: aplicar a mesma lógica do Orders — tentar primeiro por `id` (UUID), depois por `slug` como fallback.

2. **Incluir imagem no state**: expandir o tipo de `orderInfo` para incluir `productImage?: string` e buscar o campo `images` do produto.

3. **Exibir imagem**: substituir o ícone `Package` por um thumbnail do produto (quando disponível), com ~60x60px `rounded-lg object-cover`, ao lado do nome e preço.

## Arquivo afetado
- `src/pages/CheckoutSuccess.tsx`

