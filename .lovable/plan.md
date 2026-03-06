

## Plano: Corrigir scroll horizontal dos filtros IA no mobile

### Problema
O container dos filtros (`overflow-x-auto scrollbar-hide`) não responde ao arraste touch no mobile. Provável causa: falta de `touch-action: pan-x` no container, fazendo o browser interpretar o gesto como navegação da página em vez de scroll horizontal do elemento.

### Solução

**`src/pages/Customize.tsx`** — linha 309:

Adicionar `touch-action: pan-x` inline e `overscroll-behavior-x: contain` no container dos filtros para garantir que o gesto de arraste horizontal seja capturado pelo scroll do container:

```tsx
<div 
  className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1"
  style={{ touchAction: "pan-x", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch" }}
>
```

### Arquivo alterado
- `src/pages/Customize.tsx` (1 linha)

