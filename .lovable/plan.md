

## Pinch-to-Zoom no PhonePreview

### O que muda

Adicionar `onScaleChange` prop ao `PhonePreview` e implementar detecção de pinch com touch events nativos. O gesto de dois dedos controla o zoom (escala) diretamente no mockup, sincronizado com o slider externo.

### Arquivo: `src/components/PhonePreview.tsx`

1. **Nova prop**: `onScaleChange: (scale: number) => void`
2. **Refs para pinch**: `initialPinchDist` e `initialPinchScale` para rastrear o gesto
3. **Touch handlers** no container (substituindo pointer events por touch events para suportar multi-touch):
   - `onTouchStart`: Se 2 toques, calcula distância inicial entre dedos e salva escala atual. Se 1 toque, inicia drag.
   - `onTouchMove`: Se 2 toques, calcula nova distância, aplica ratio na escala (clamp 50–200). Se 1 toque, aplica drag.
   - `onTouchEnd`: Reseta estado de pinch/drag.
4. **Manter pointer events** para mouse (desktop drag) — touch events tratam mobile.
5. Remover `touch-none` do container para permitir touch events nativos (adicionar `touch-manipulation` para evitar zoom do browser sem bloquear nossos handlers).

### Arquivo: `src/pages/Customize.tsx`

- Passar `onScaleChange={setScale}` para `PhonePreview`.

### Lógica do pinch

```text
dist = √((t1.x - t2.x)² + (t1.y - t2.y)²)
ratio = currentDist / initialDist
newScale = clamp(initialScale * ratio, 50, 200)
```

