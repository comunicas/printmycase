## Estado atual — Customização

Última refatoração concluída. Código limpo, sem legados.

### Resumo das limpezas realizadas
- Removido campo `preview_css` do admin (AiFiltersManager) — prévia usa `style_image_url` via long-press
- Simplificado `UpscaleConfirmDialog` para mostrar apenas custo em moedas (consistente com FilterConfirmDialog)
- Toast de download movido para `useCustomize.handleDownload` (async correto)
- `ContinueBar` agora faz `await onDownload()` antes de mostrar feedback visual
- Tipo `AiFilter` em `customize-types.ts` sem `preview_css`
- Branch dedicado para modelo `kontext` na edge function `apply-ai-filter`
- Filtro "Cartoon" corrigido para `claymation`
- 6 novos filtros inativos adicionados (dark_academia, vaporwave, synthwave, golden_hour, bokeh_effect, dramatic_lighting)
