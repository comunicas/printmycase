

## Ajustar SEO e remover avaliações da página de produto

### Problemas identificados

1. **aggregateRating no JSON-LD** — Está incluindo `rating` e `review_count` mesmo quando os valores são 0, o que gera erros no Google Rich Results (rating/reviewCount inválidos)
2. **Avaliações visíveis** — O `StarRating` é exibido no `ProductInfo` mas o usuário quer remover
3. **Código morto** — As linhas 139-140 (clarityEvent/clarityTag) nunca executam pois estão após o `return` do cleanup
4. **Meta tags `product:` ausentes** — Faltam tags Open Graph específicas de produto (`product:price:amount`, `product:price:currency`)
5. **Categoria no schema** — Falta `category` no schema Product

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/pages/Product.tsx` | Remover `aggregateRating` do JSON-LD; adicionar `category: "Capas para Celular"`; adicionar metas OG de produto; corrigir código morto do Clarity (mover antes do return) |
| `src/components/ProductInfo.tsx` | Remover `StarRating` e sua importação |

### JSON-LD corrigido (sem aggregateRating, com category)

```json
{
  "@type": "Product",
  "name": "...",
  "category": "Capas para Celular",
  "brand": { "@type": "Brand", "name": "..." },
  "offers": { "@type": "Offer", ... }
}
```

