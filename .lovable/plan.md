

## Alterar vitrine da home para exibir Coleções + CTA fixo

### O que muda

A seção "Escolha um modelo" atualmente mostra 4 produtos individuais. Será alterada para:

1. **Primeiro card fixo** — Um card de CTA estilizado ("Personalize sua Capinha") que leva para `/customize`. Não é um produto, é um card visual com ícone/ilustração e botão.
2. **Cards seguintes** — Exibem as **coleções ativas** (cover_image, nome), linkando para `/colecao/{slug}`. Mostra até 3 coleções para manter o grid 4 colunas.

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/pages/Landing.tsx` | Substituir o grid de `featuredProducts` por: 1 card CTA fixo + cards de coleções. Remover `useProducts(4)` (se não usado em outro lugar da page). Usar `collections` que já é carregado. Remover a seção separada de "Coleções Exclusivas" mais abaixo para evitar duplicidade. |
| 2 | `src/components/CollectionCard.tsx` | **Novo** — Card de coleção com cover_image, nome, hover effect. Link para `/colecao/{slug}`. Reutilizável. |

### Layout do grid

```text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  🎨 CTA      │ │  Coleção 1   │ │  Coleção 2   │ │  Coleção 3   │
│  Personalize │ │  (cover)     │ │  (cover)     │ │  (cover)     │
│  sua Capinha  │ │              │ │              │ │              │
│  [Botão]     │ │  Nome        │ │  Nome        │ │  Nome        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                          "Ver Todas as Coleções >"
```

- Mobile: grid 2 colunas (CTA + 1 coleção na primeira linha)
- O título da seção muda para "Escolha um modelo" (mantém)
- Botão inferior muda para "Ver Todas as Coleções"
- A seção "Coleções Exclusivas" mais abaixo é removida (agora redundante)

### CTA Card
- Background gradient primary com ícone de smartphone/palette
- Texto: "Personalize sua Capinha" + subtexto "Envie sua foto e crie um design único"
- Botão: "Começar" com seta
- `onClick → navigate("/customize")`

