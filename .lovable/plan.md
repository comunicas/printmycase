

## Problema

O mapa Leaflet do `StoreLocator` aparece sobre o `AiGalleryModal` porque:
- Leaflet define z-index internos altos: `.leaflet-pane` (400), `.leaflet-top/bottom` (1000), `.leaflet-control` (800).
- O modal usa `z-50` (= 50 no Tailwind), muito menor que esses valores.
- `bg-background/95` é translúcido, então mesmo "atrás", os tiles vazam visualmente.

Além disso, hoje o grid usa `columns-2 sm:columns-3 md:columns-4` (masonry), mas o usuário quer **6 imagens por linha**.

## Solução

### 1. Corrigir z-index do modal (`src/components/AiGalleryModal.tsx`)

- Trocar `z-50` por `z-[2000]` no container do grid (acima dos controles do Leaflet ≤1000).
- Trocar `z-[60]` por `z-[2010]` no lightbox (acima do próprio modal).
- Trocar `bg-background/95 backdrop-blur-sm` por `bg-background` (opaco) para garantir que nada vaze, mesmo se algum elemento ainda escapar do empilhamento.

### 2. Grid de 6 colunas

Substituir o layout masonry (`columns-*`) por um grid fixo:

```tsx
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
```

E em cada item trocar `break-inside-avoid` por `aspect-square` para manter as células uniformes (necessário em grid não-masonry):

```tsx
<div className="group relative aspect-square rounded-xl overflow-hidden ...">
  <img ... className="w-full h-full object-cover ..." />
</div>
```

Mobile (3 cols) → tablet (4) → desktop (6). Isso mantém boa densidade no mobile sem ficar microscópico, e atinge o pedido de 6/linha no desktop.

Skeleton loading também passa para `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6`.

### Arquivos
- `src/components/AiGalleryModal.tsx` — ~10 linhas alteradas (z-index, bg, grid classes, item classes).

