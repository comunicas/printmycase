

## Problema: Drag no mobile move a página inteira

### Causa raiz

Dois problemas no `PhonePreview.tsx`:

1. **`touch-manipulation` permite panning** — A classe `touch-manipulation` do Tailwind aplica `touch-action: manipulation`, que ainda permite scroll/pan do navegador. Para drag dentro do frame, precisamos de `touch-action: none` para bloquear completamente o comportamento padrão do browser.

2. **`e.preventDefault()` ausente no drag de 1 dedo** — No `onTouchMove`, o `preventDefault()` só é chamado no caso de pinch (2 dedos). No drag com 1 dedo, o browser intercepta o toque e faz scroll da página. Precisa chamar `preventDefault()` também no drag.

### Correções

**src/components/PhonePreview.tsx**:

1. Trocar `touch-manipulation` por `touch-none` no container de drag (quando há imagem):
```tsx
className={`absolute inset-0 z-10 ${image ? 'touch-none' : 'touch-manipulation'} group/drag ...`}
```

2. Adicionar `e.preventDefault()` no `onTouchMove` para drag de 1 dedo:
```tsx
} else if (e.touches.length === 1 && isDragging && !isPinching.current) {
  e.preventDefault(); // ← ADICIONAR: impede scroll da página
  const rect = ...
```

3. Como `preventDefault()` em touch events passivos não funciona em React, registrar o `touchmove` via `addEventListener` com `{ passive: false }` no `useEffect`, similar ao que já é feito para `wheel`.

Isso resolve o problema de o frame não ficar "fixo" no mobile — o toque será capturado exclusivamente pelo drag handler.

