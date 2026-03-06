

## Revisão e Correções do PhonePreview

### Problemas identificados

1. **Bug: Conflito pointer events + touch events no mobile** — No mobile, um toque dispara AMBOS `onPointerDown` e `onTouchStart`, causando drag duplo (jitter). O `onPointerDown` precisa ignorar toques, já que touch events tratam mobile.

2. **Zoom indicator já existe** — O slider em `Customize.tsx` já mostra `{scale}%` ao lado. Não há necessidade de adicionar outro indicador.

3. **Sem outros bugs ou legados** — A implementação de pinch, wheel e drag está consistente. A função `clamp` usa defaults corretos nos contextos onde é chamada.

### Correção necessária

**src/components/PhonePreview.tsx** — No `onPointerDown`, adicionar guard para ignorar touch:

```typescript
const onPointerDown = useCallback((e: React.PointerEvent) => {
  if (!image || e.pointerType === 'touch') return; // skip touch — handled by onTouchStart
  // ... rest stays the same
}, [image, position]);
```

Isso garante que mouse/pen usam pointer events e touch usa touch events, sem conflito.

### Nenhuma outra mudança necessária

A implementação está limpa e funcional. Não há código legado para remover.

