

## Modal de resolucao baixa + modais fullscreen no mobile

### Resumo
Substituir o toast de resolucao baixa por uma modal intuitiva com botao direto de Upscale, e ajustar o `DialogContent` base para ser fullscreen no mobile.

### Alteracoes

**1. `src/components/ui/dialog.tsx`** — DialogContent fullscreen no mobile
- Adicionar classes ao `DialogContent` base: `h-full rounded-none sm:h-auto sm:rounded-lg`
- Isso faz todas as modais do projeto ficarem fullscreen no mobile automaticamente, sem alterar cada componente individual
- Remover `max-w-lg` padrao e usar `max-w-full sm:max-w-lg` para ocupar tela toda no mobile

**2. Criar `src/components/customize/LowResolutionDialog.tsx`** — Nova modal
- Props: `open`, `onOpenChange`, `resolution: {w,h} | null`, `onUpscale: () => void`, `hasUpscaleFilter: boolean`
- Icone informativo (ZoomIn ou similar), titulo "Resolucao baixa"
- Texto amigavel: "Filtros de estilo precisam de no minimo 256x256px para gerar bons resultados. Use o Upscale IA para aumentar a resolucao da sua imagem."
- Mostrar resolucao atual (ex: "Sua imagem: 120x90px")
- Botao primario: "Aplicar Upscale IA" (chama `onUpscale`)
- Botao outline: "Cancelar"
- Se `hasUpscaleFilter` for false, mostrar apenas mensagem sem botao de upscale

**3. `src/hooks/customize/useCustomizeFilters.ts`** — Trocar toast por estado
- Adicionar `showLowResDialog: boolean` (default false)
- No check de 256x256 (linha 120-125), substituir `toast(...)` por `setShowLowResDialog(true)`
- Adicionar `handleLowResUpscale`: encontrar filtro com `model_url` contendo `"aura-sr"`, chamar `setPendingFilterId(upscaleFilter.id)` e fechar dialog
- Expor: `showLowResDialog`, `setShowLowResDialog`, `handleLowResUpscale`

**4. `src/pages/Customize.tsx`** — Montar a nova modal
- Importar e renderizar `LowResolutionDialog`
- Passar `c.showLowResDialog`, `c.imageResolution`, handler que chama `c.handleLowResUpscale`
- `hasUpscaleFilter`: `c.filters.some(f => f.model_url?.includes("aura-sr"))`

**5. Ajustar `FilterConfirmDialog.tsx`** — Remover `max-w-xs` custom
- Trocar `max-w-xs rounded-xl` por `sm:max-w-xs` (o base ja cuida do fullscreen mobile)

**6. Ajustar `TermsDialog.tsx`, `UpscaleConfirmDialog.tsx`** — Mesmo padrao
- Remover `max-w-md` / `max-w-xs` custom, usar `sm:max-w-md` / `sm:max-w-xs`

### Fluxo
1. Usuario clica num filtro de estilo com imagem pequena
2. Abre modal explicativa com resolucao atual e botao de Upscale
3. Ao clicar "Aplicar Upscale IA", fecha a modal e abre o `FilterConfirmDialog` padrao para confirmar o custo do upscale
4. Apos upscale, usuario pode aplicar o filtro desejado normalmente

