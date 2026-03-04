

# Incluir imagem e nome do produto nos pedidos

## Problema
O `product_id` nos pedidos às vezes contém um UUID em vez do slug, fazendo com que o fallback mostre o UUID cru. Além disso, não há imagem do produto nos cards.

## Mudanças em `src/pages/Orders.tsx`

1. **Buscar imagens junto com nomes**: alterar a query de products para incluir `slug, name, images` e também buscar por `id` (UUID) além de `slug`, cobrindo ambos os casos.

2. **Guardar imagem no state**: expandir o tipo para incluir `product_image?: string` e mapear a primeira imagem do produto.

3. **Exibir imagem no card**: adicionar um thumbnail do produto (primeira imagem) ao lado do nome no header do card, com tamanho ~60x60px e `rounded-lg object-cover`.

4. **Layout do header**: reorganizar para `flex` horizontal com imagem à esquerda, nome/data no centro, e preço à direita.

## Arquivos afetados
- `src/pages/Orders.tsx`

