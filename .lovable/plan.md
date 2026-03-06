

## Adicionar Wheel-to-Zoom no PhonePreview

Adicionar handler `onWheel` no container do mockup para ajustar o zoom via scroll do mouse.

### Arquivo: `src/components/PhonePreview.tsx`

- Adicionar `onWheel` handler no `containerRef` div
- `e.preventDefault()` para evitar scroll da página
- `deltaY` negativo = zoom in, positivo = zoom out
- Step de ~5 por tick, clamp 50–200
- Requer `onScaleChange` prop (já existe)
- Usar `useEffect` com `addEventListener('wheel', ..., { passive: false })` no containerRef para poder chamar `preventDefault` (React synthetic onWheel é passive por padrão)

