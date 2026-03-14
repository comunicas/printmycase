

## Skeleton Loading nos Cards do Catálogo

Criar um componente `ProductCardSkeleton` e usá-lo no `Catalog.tsx` no lugar do `LoadingSpinner` durante o carregamento.

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/components/ProductCardSkeleton.tsx` | Novo componente que replica a estrutura do `ProductCard` com blocos animados (pulse) para imagem, título, preço e botão |
| `src/pages/Catalog.tsx` | Substituir `<LoadingSpinner />` por um grid de 8 `<ProductCardSkeleton />` |

### Estrutura do skeleton

```text
┌─────────────┐
│  ████████   │  ← aspect-square bg-muted animate-pulse
│  ████████   │
├─────────────┤
│ ██████████  │  ← título (2 linhas)
│ ████        │  ← preço badge
│ [████████]  │  ← botão
└─────────────┘
```

O skeleton usa as mesmas dimensões e padding do `ProductCard` real (`p-2.5`, `aspect-square`, `text-[13px]`) para transição suave.

