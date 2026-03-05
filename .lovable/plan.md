

## Correção dos Warnings de forwardRef

Os warnings ocorrem porque componentes funcionais simples estão recebendo refs de componentes pai (Radix UI internamente tenta passar refs). A correção é envolver cada componente afetado com `React.forwardRef`.

### Componentes a corrigir

| Componente | Arquivo |
|---|---|
| `LoadingSpinner` | `src/components/ui/loading-spinner.tsx` |
| `StarRating` | `src/components/StarRating.tsx` |
| `ProductInfo` | `src/components/ProductInfo.tsx` |
| `ProductDetails` | `src/components/ProductDetails.tsx` |

### Alteração em cada arquivo

Envolver o componente com `React.forwardRef`, passando o `ref` para o elemento `<div>` raiz. Exemplo padrão:

```tsx
// Antes
const Component = (props: Props) => {
  return <div>...</div>;
};

// Depois
const Component = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>...</div>;
});
Component.displayName = "Component";
```

Nenhuma mudança funcional — apenas suprime os warnings do console.

