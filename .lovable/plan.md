

## Animacao slide-down ao fechar o overlay

### Problema
O overlay e removido do DOM instantaneamente (`{mobileTab && <MobileTabOverlay />}`), sem tempo para a animacao de saida.

### Solucao
Manter o overlay sempre montado quando ha uma tab pendente de fechar, e usar um estado `isClosing` para animar o slide-down antes de desmontar.

**`src/components/customize/MobileTabOverlay.tsx`**
- Adicionar estado `isClosing` e funcao `handleClose` que:
  1. Seta `isClosing = true`
  2. Apos 300ms (duracao da transicao), chama `onClose()`
- Backdrop: adicionar transicao de opacidade (fade-out junto com slide-down)
- Bottom sheet: trocar classe `translate-y-0` para `translate-y-full` quando `isClosing`
- Aplicar mesma logica no `handleGallerySelect` e click no backdrop

**`src/pages/Customize.tsx`**
- Nenhuma alteracao necessaria — o componente gerencia o fechamento internamente antes de chamar `onClose`

### Resultado
O bottom sheet desce suavemente em 300ms antes de ser removido do DOM, com o backdrop fazendo fade-out simultaneamente.

