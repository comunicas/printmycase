

## Galeria pública com layout masonry

### Alteração

**`src/components/PublicGallerySection.tsx`** — Trocar grid quadrado (`aspect-square`) por layout masonry com alturas variadas usando CSS columns.

- Usar `columns-2 md:columns-4` com `break-inside-avoid` nos cards
- Alternar aspect ratios (`aspect-[3/4]`, `aspect-square`, `aspect-[4/5]`) por índice para criar efeito masonry natural
- Manter hover overlay, lazy loading e ScrollReveal

### Arquivo afetado
| Arquivo | Alteração |
|---------|-----------|
| `src/components/PublicGallerySection.tsx` | Grid → CSS columns masonry com alturas variadas |

