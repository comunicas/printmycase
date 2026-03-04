

# ProductCard — Formato quadrado + CTA "Customizar"

## Mudanças em `src/components/ProductCard.tsx`

1. **Imagem quadrada**: Trocar `aspect-[3/4]` por `aspect-square` para otimizar espaço no grid
2. **Botão CTA**: Adicionar um botão "Customizar" abaixo do rating que navega para `/customize/{slug}`, com `e.stopPropagation()` para não conflitar com o click do card (que vai para a página do produto)

## Mudanças em `src/pages/Catalog.tsx`

3. **Grid ajustado**: Opcionalmente ajustar gap ou colunas para aproveitar melhor o formato quadrado (grid atual já funciona bem)

## Arquivo afetado

| Arquivo | Mudança |
|---------|---------|
| `src/components/ProductCard.tsx` | aspect-square + botão "Customizar" |

