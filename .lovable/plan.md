

## Plano: Fix PhonePreview no iPhone SE (320×568)

No viewport 320×568, o mockup de 200×410px + header + tabs + controls + bottom bar excede o espaço vertical. O topo do smartphone é cortado.

### Solução

**`src/components/PhonePreview.tsx`**:
- Adicionar breakpoint extra para telas muito pequenas: `h-[340px] w-[166px]` quando `max-h-[600px]`
- Usar classes CSS com media query ou abordagem com `min-h` no container

Abordagem mais simples e robusta: usar `max-h-[50vh]` com `aspect-ratio` no container do mockup em vez de alturas fixas, garantindo que nunca ultrapasse metade da tela.

**Mudança concreta no `PhonePreview.tsx`**:
- Trocar dimensões fixas `w-[200px] h-[410px]` por `w-[200px] h-[min(410px,50dvh)]` via style inline
- Manter `lg:w-[260px] lg:h-[532px]` para desktop

**`src/components/customize/ImageControls.tsx`**:
- Reduzir `mt-3` para `mt-2` nos TabsContent para ganhar espaço vertical

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/components/PhonePreview.tsx` | Altura responsiva com `min(410px, 50dvh)` |
| `src/components/customize/ImageControls.tsx` | Reduzir margin-top dos tabs |

