

## Mostrar Imagem do Modelo Selecionado na Página do Design

### O que muda

Quando o usuário seleciona um modelo de celular no dropdown, exibir a **imagem do aparelho** (`device_image`) abaixo do seletor para que ele visualize em qual modelo a capinha será aplicada. A thumbnail de zoom passa a mostrar a `device_image` do modelo selecionado (não mais a imagem do design duplicada).

### Alteração

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/pages/DesignPage.tsx` | Derivar o produto selecionado (`selectedProduct`) a partir de `products` + `selectedProductId`. Abaixo do dropdown de modelo, exibir a `device_image` do produto selecionado em um card com label "Seu modelo:" e o nome. Se não houver `device_image`, não renderiza nada. Adicionar hover/click zoom na imagem do aparelho (reutilizar a mesma lógica de overlay). |

### Layout

```text
Escolha o modelo do seu celular
┌─────────────────────────────┐
│  iPhone 16 Pro Max       ▼  │
└─────────────────────────────┘

Seu modelo:
┌─────────────────┐
│                 │  ← device_image do produto (rounded, border, ~120px height)
│   📱 Aparelho   │
│                 │
└─────────────────┘
  iPhone 16 Pro Max
  (click/hover para ampliar)
```

### Detalhes

- `const selectedProduct = products.find(p => p.id === selectedProductId)`
- Se `selectedProduct?.device_image` existe, renderiza imagem com `object-contain`, fundo `bg-muted`, `rounded-xl`, max-h de ~160px
- Click/hover abre overlay de zoom (reutiliza estado `showZoom` existente, mas com `zoomImage` state para alternar entre design e device)
- Trocar de modelo atualiza a imagem instantaneamente

