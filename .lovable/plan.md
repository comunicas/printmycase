

## Feedback haptico + animacao de highlight

### Alteracoes

**1. `src/components/customize/MobileTabOverlay.tsx`** - Haptico no swipe-down
- No `handleTouchEnd`, quando `dragDeltaY > 80` (vai fechar), chamar `navigator.vibrate?.(15)` antes de `handleClose()`
- Vibração curta de 15ms para feedback sutil

**2. `src/components/customize/FilterHistoryBar.tsx`** - Animacao de entrada
- Adicionar `useRef` para rastrear o `prevLength` do `filterHistory`
- Quando `filterHistory.length` aumenta (novo filtro adicionado), aplicar classe `animate-fade-in` temporariamente no container
- Usar `useEffect` + estado `isNew` com timeout de 600ms para remover a classe apos a animacao
- Adicionar um leve `ring-2 ring-primary/30` durante a animacao para efeito de highlight visual

### Detalhes tecnicos
- `navigator.vibrate()` e suportado na maioria dos Android; no iOS Safari nao funciona mas o optional chaining (`?.`) evita erros
- A animacao `animate-fade-in` ja existe no projeto (keyframe definido no tailwind config)
- O highlight usa ring do Tailwind com transicao suave

