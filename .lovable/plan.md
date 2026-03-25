

## Trocar Hover por Click no Zoom das Imagens

### Problema
As imagens (design e device) abrem o zoom no `onMouseEnter`. O usuário quer que o zoom só abra no **click**.

### Alteração em `src/pages/DesignPage.tsx`

1. **Imagem principal do design** — Adicionar `cursor-zoom-in` e `onClick` para abrir zoom
2. **Thumbnail do design** — Remover `onMouseEnter`, manter apenas `onClick` para toggle
3. **Card do device image** — Remover `onMouseEnter`, manter apenas `onClick` para toggle
4. **Overlay** — Remover `onMouseLeave`, fechar apenas por click no backdrop ou Escape

