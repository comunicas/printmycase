

## Thumbnail com Hover Zoom na Página do Design

### O que muda

Abaixo da imagem principal do design, adicionar uma **thumbnail clicável** da imagem. Ao passar o mouse (hover) ou tocar (mobile), exibe um **overlay/modal com a imagem em tamanho grande** para o usuário conferir os detalhes antes de finalizar.

### Alteração

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/pages/DesignPage.tsx` | Adicionar thumbnail abaixo da imagem principal + estado `showZoom`. Ao hover na thumb, exibe overlay fullscreen com a imagem ampliada. No mobile, click abre/fecha o overlay. |

### Layout

```text
┌──────────────────────┐
│                      │
│   Imagem principal   │  ← já existe (aspect-square)
│                      │
└──────────────────────┘
┌────────┐
│ thumb  │  ← nova (w-16 h-16, borda, cursor zoom-in)
└────────┘
   hover → overlay escuro com imagem grande (max-w-3xl, click para fechar)
```

### Comportamento

- Thumbnail: miniatura 64×64px com borda, `cursor-pointer`
- Hover (desktop): abre overlay com `fixed inset-0 bg-black/80 z-50` contendo a imagem em tamanho grande (`max-w-3xl max-h-[90vh] object-contain`)
- Click (mobile): toggle do overlay
- Click no overlay ou pressionar Escape: fecha
- Texto auxiliar sob a thumb: "Passe o mouse para ampliar"

