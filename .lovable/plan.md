

## Indicação visual de pedidos de coleção na página de pedidos

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/pages/Orders.tsx` | Enriquecer tipo `OrderWithProduct` com `design_name?` e `design_image?`. No fetch, buscar dados do design para pedidos com `design_id`. Exibir imagem do design + badge "Coleção" no card. |
| `src/components/admin/OrdersManager.tsx` | Mesmo enriquecimento para o admin: mostrar nome/imagem do design quando `design_id` presente. |

### Detalhes

**Tipo estendido:**
```typescript
type OrderWithProduct = Tables<"orders"> & {
  product_name?: string;
  product_image?: string;
  design_name?: string;
  design_image?: string;
};
```

**Fetch (Orders.tsx):** Após resolver produtos, coletar `design_id`s não-nulos → query `collection_designs` por IDs → mapear nome e imagem no enriquecimento.

**Card visual:** Quando `design_image` existe, mostrar duas imagens lado a lado (design à esquerda, modelo à direita em tamanho menor) + badge "Coleção" em roxo/primary. O nome exibido muda para `"{design_name} — {product_name}"`.

**Admin (OrdersManager.tsx):** Mesmo padrão de enriquecimento, exibir nome do design ao lado do produto.

