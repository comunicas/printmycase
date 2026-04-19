
## Situação atual

A `CollectionPage.tsx` já possui um `ItemList` JSON-LD — está aninhado como `mainEntity` do `CollectionPage`, com cada item sendo um `Product` completo (name, sku, brand, image, offers, aggregateRating). Isso é tecnicamente correto, mas:

1. O `ItemList` fica "escondido" como sub-entidade — Google detecta, mas o sinal é mais fraco para "carrossel de itens" do que um `ItemList` independente no `@graph`.
2. Não há `name` nem `url` no próprio `ItemList`, que ajudam o Google a entender a lista como entidade separada (útil para Rich Results de carrossel).

## Plano

Promover o `ItemList` a uma entidade própria no `@graph` (ao lado de `CollectionPage` e `BreadcrumbList`), mantendo o `mainEntity` apontando para ele via `@id` para preservar a relação semântica.

### Mudança em `src/pages/CollectionPage.tsx`

1. Definir `itemListId = ${url}#designs`
2. Extrair o `ItemList` para um objeto separado no `@graph`, adicionando:
   - `@id: itemListId`
   - `name: "Designs da coleção {collection.name}"`
   - `url`
   - `numberOfItems`
   - `itemListOrder: "https://schema.org/ItemListOrderAscending"`
3. No `CollectionPage`, substituir o `mainEntity` inline por `mainEntity: { "@id": itemListId }` (referência)
4. Manter os `Product` completos dentro do `ItemList` (não mexer)

### Estrutura final do `@graph`

```
[
  CollectionPage { mainEntity: { @id: "...#designs" } },
  ItemList { @id: "...#designs", itemListElement: [Product, Product, ...] },
  BreadcrumbList
]
```

### Fora de escopo
- Não mudar UI da página
- Não mexer em `merchantOffer`, `aggregateRating`, `BRAND`
- Não criar entrada no `mainEntity` quando `designs.length === 0` (mantém comportamento atual)

### Arquivo
- `src/pages/CollectionPage.tsx` — refatoração do bloco JSON-LD (~15 linhas alteradas)
