

## Vitrine da Home: Produtos + CTA fixo

### O que muda

A seção "Escolha um modelo" passa a exibir **produtos reais** (ordenados por `updated_at` desc) ao invés de coleções. O primeiro card continua sendo o CTA fixo "Personalize sua Capinha".

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/hooks/useProducts.ts` | Alterar ordenação de `created_at` para `updated_at` (desc) |
| 2 | `src/pages/Landing.tsx` | Importar `useProducts` e `ProductCard`. Substituir os `CollectionCard` por produtos (`products.slice(0, 7)`). Manter CTA fixo como primeiro card. Botão inferior muda para "Ver Todos os Modelos" linkando para `/catalog`. Remover import de `CollectionCard` e `useCollections`. |

### Layout

```text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  CTA         │ │  Produto 1   │ │  Produto 2   │ │  Produto 3   │
│  Personalize │ │  (device_img)│ │  (device_img)│ │  (device_img)│
│  [Começar]   │ │  Nome/Preço  │ │  Nome/Preço  │ │  Nome/Preço  │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│  Produto 4   │ │  Produto 5   │ │  Produto 6   │ │  Produto 7   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                    "Ver Todos os Modelos >"
```

- Grid 2 colunas mobile, 4 desktop
- 1 CTA + 7 produtos = 8 cards (2 linhas completas)
- `useProducts(7)` para limitar a query

