

## Layout Side-by-Side + ModelSelector + Revisão de Largura/Rolagem

### Alterações

**1. `src/components/customize/ModelSelector.tsx`** (novo)
- DropdownMenu acionado ao clicar na imagem+nome do produto no header
- Lista produtos ativos via `useProducts()` com thumbnail (`device_image`), nome (sem "Capa ") e preço
- Produto atual destacado (bold/check)
- Ao selecionar, navega para `/customize/{slug}`
- ChevronDown ao lado do nome indica interatividade

**2. `src/components/customize/CustomizeHeader.tsx`**
- Substituir bloco estático imagem+nome por `<ModelSelector currentSlug={slug} productName={...} productImage={...} />`
- Receber `currentSlug` como nova prop (passado de Customize.tsx via `c.product?.slug`)

**3. `src/pages/Customize.tsx`**
- Passar `currentSlug={c.product?.slug}` para CustomizeHeader
- Sidebar desktop: trocar `lg:w-1/2` por `lg:w-[420px] lg:flex-shrink-0` — largura fixa mais adequada para os controles
- Preview: trocar `lg:w-1/2` por `lg:flex-1` — ocupa o restante

**4. `src/components/customize/ImageControls.tsx`**
- No desktop, filtros tab: trocar `max-h-[30vh]` por `lg:max-h-none lg:overflow-visible` — no desktop o aside já tem `overflow-y-auto`, scroll duplo é desnecessário
- Mobile mantém `max-h-[30vh] overflow-y-auto`

### Arquivos alterados
1. `src/components/customize/ModelSelector.tsx` — novo
2. `src/components/customize/CustomizeHeader.tsx` — integrar ModelSelector
3. `src/pages/Customize.tsx` — passar slug, ajustar larguras sidebar/preview
4. `src/components/customize/ImageControls.tsx` — corrigir scroll filtros desktop

