

## Corrigir Warning de forwardRef

### Problema
`TabsContent` (Radix UI) tenta passar `ref` aos filhos diretos. `AdjustmentsPanel` e `AiFiltersList` são componentes funcionais simples que não aceitam `ref`, gerando warnings no console.

### Correção

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `AdjustmentsPanel.tsx` | Converter para `forwardRef` — wrapping a `div` raiz com a ref recebida |
| 2 | `AiFiltersList.tsx` | Converter para `forwardRef` — wrapping a `div` raiz com a ref recebida |

### Exemplo da mudança

```tsx
// Antes
const AdjustmentsPanel = ({ scale, ... }: Props) => (
  <div className="space-y-3">...</div>
);

// Depois
const AdjustmentsPanel = forwardRef<HTMLDivElement, Props>(
  ({ scale, ... }, ref) => (
    <div ref={ref} className="space-y-3">...</div>
  )
);
AdjustmentsPanel.displayName = "AdjustmentsPanel";
```

Mesma abordagem para `AiFiltersList`. Sem mudança visual ou funcional — apenas elimina os warnings do console.

