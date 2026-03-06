

## Verificação Mobile + Feedback Háptico

### Verificação do layout
Testei a página `/customize/motorola-edge-50-pro` em viewport 375×812 (iPhone X). O layout está correto: sem scroll vertical, todo o conteúdo (mockup, zoom slider, bottom bar) visível na viewport. A limitação do browser de teste impede simular drag com touch real, mas o código já tem `touch-none` e `preventDefault()` no touchmove — a correção está aplicada.

### Adicionar feedback háptico

**src/components/PhonePreview.tsx** — Adicionar vibração ao iniciar drag e pinch no mobile:

1. No `handleTouchStart`, após detectar início de drag (1 dedo) ou pinch (2 dedos), chamar `navigator.vibrate(10)` para um pulso curto de 10ms:

```typescript
const handleTouchStart = (e: TouchEvent) => {
  if (!image) return;
  if (e.touches.length === 2) {
    isPinching.current = true;
    // ... existing pinch setup
    navigator.vibrate?.(10); // haptic pulse
  } else if (e.touches.length === 1 && !isPinching.current) {
    setIsDragging(true);
    // ... existing drag setup
    navigator.vibrate?.(10); // haptic pulse
  }
};
```

Usa optional chaining (`vibrate?.()`) para não quebrar em browsers que não suportam (Safari/iOS não suporta, mas não lança erro). Funciona nativamente em Android Chrome sem nenhuma dependência extra.

