

## Fix forwardRef warning no FormField

### Problema
`FormField` é um componente funcional simples que não aceita `ref`. Quando usado dentro de `Dialog` (Radix UI), o Radix tenta passar `ref` para o children, gerando warning de `forwardRef`.

### Correção

**`src/components/ui/form-field.tsx`** — Envolver com `forwardRef`:

```tsx
import { forwardRef, ReactNode } from "react";

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, id, required, error, hint, className, labelExtra, children }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)}>
      ...
    </div>
  )
);
FormField.displayName = "FormField";
```

Um único arquivo afetado: `src/components/ui/form-field.tsx`.

