

## Vitrine da Home: Designs das Coleções + CTA fixo

### O que muda

A seção "Escolha um modelo" passa a exibir **designs das coleções** (`collection_designs`) ao invés de produtos (modelos de celular). O primeiro card continua sendo o CTA fixo.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/pages/Landing.tsx` | Substituir `useProducts` por query de `collection_designs` (todas as ativas, com join na collection para pegar o slug). Renderizar cards com `image_url`, `name`, `price_cents`. Cada card linka para `/colecao/{collectionSlug}/{designSlug}`. Botão inferior: "Ver Todas as Coleções" → `/colecoes`. Remover import de `ProductCard` e `useProducts`. |
| 2 | `src/hooks/useCollectionDesigns.ts` | **Novo** — Hook `useAllDesigns(limit?)` que busca `collection_designs` ativas com `collections.slug` via join, ordenadas por `created_at desc`. Retorna array com `image_url`, `name`, `price_cents`, `slug`, `collection_slug`. |

### Layout (mesmo grid atual)

```text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  CTA         │ │  Design 1    │ │  Design 2    │ │  Design 3    │
│  Personalize │ │  (image_url) │ │  (image_url) │ │  (image_url) │
│  [Começar]   │ │  Nome/Preço  │ │  Nome/Preço  │ │  Nome/Preço  │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│  Design 4    │ │  Design 5    │ │  Design 6    │ │  Design 7    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                    "Ver Todas as Coleções >"
```

- Cada card de design mostra `image_url`, `name`, `formatPrice(price_cents/100)`
- Click navega para `/colecao/{collection.slug}/{design.slug}`
- Query: `supabase.from("collection_designs").select("*, collections!inner(slug)").eq("active", true).order("created_at", { ascending: false }).limit(7)`

