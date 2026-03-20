

## Refatoracao: Filtros IA (Grid Thumbnails) + Code Review Fixes

### 1. Redesign AiFiltersList — Grid de Thumbnails

**`src/components/customize/AiFiltersList.tsx`**

Substituir layout de botoes pill por grid visual:
- Grid `grid-cols-3 gap-2` com cards visuais
- Cada card: thumbnail `aspect-square rounded-lg` com `style_image_url` como background `object-cover`
- Nome do filtro abaixo em `text-[10px] text-center`
- Badge `🪙{cost}` no canto superior direito
- Ativo: `ring-2 ring-primary ring-offset-1`
- Processando: overlay escuro + spinner centralizado
- Fallback (sem `style_image_url`): gradiente + icone `Wand2`
- Botoes comparar/remover permanecem acima sem alteracao

### 2. ImageControls — Ajustes de layout

**`src/components/customize/ImageControls.tsx`**

- Container: `max-w-xs` -> `max-w-sm` (acomodar grid 3 colunas)
- Filtros tab content: adicionar `max-h-[30vh] overflow-y-auto` para scroll em mobile

### 3. Code Review Fixes em useCustomize

**`src/hooks/useCustomize.tsx`**

- **Linha 78**: remover `(supabase as any)` — usar tipagem correta do client
- **`handleFilterConfirm` (linha 316)**: adicionar `coinBalance`, `aiFilterCost`, `aiUpscaleCost` nas deps do `useCallback`
- **`handleUpscaleConfirm` (linha 377)**: adicionar `coinBalance`, `aiFilterCost`, `aiUpscaleCost` nas deps do `useCallback`
- Adicionar comentario no `rawImage` state explicando seu uso

### Arquivos alterados
1. `src/components/customize/AiFiltersList.tsx` — redesign completo para grid
2. `src/components/customize/ImageControls.tsx` — max-width + scroll
3. `src/hooks/useCustomize.tsx` — fix deps, remover `as any`, comentario

### Arquivos revisados sem alteracao
- `src/pages/Customize.tsx`, `src/components/PhonePreview.tsx`, `src/components/customize/AdjustmentsPanel.tsx`, `src/lib/customize-types.ts`, `src/lib/image-utils.ts`

