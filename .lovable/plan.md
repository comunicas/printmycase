

## Preview de filtro com long-press + simplificar modal

### Ideia
Ao segurar (long-press) um botão de filtro na lista, a imagem do usuário aparece no PhonePreview com um filtro CSS aplicado como prévia aproximada. Ao soltar, volta ao normal. Zero custo de IA — é só CSS.

Ao clicar (tap normal), abre a modal de confirmação para gerar via IA como já funciona.

### Alterações

**1. Migração SQL — coluna `preview_css` na tabela `ai_filters`**
- `ALTER TABLE ai_filters ADD COLUMN preview_css text` (nullable)
- Exemplos de valores: `grayscale(1)`, `sepia(0.8) saturate(1.5)`, `hue-rotate(180deg) contrast(1.2)`

**2. `src/lib/customize-types.ts`** — Adicionar `preview_css: string | null` ao tipo `AiFilter`

**3. `src/hooks/useCustomize.tsx`** — Incluir `preview_css` no select dos filtros

**4. `src/components/customize/AiFiltersList.tsx`** — Long-press preview
- Adicionar props: `onPreviewStart(cssFilter: string)` e `onPreviewEnd()`
- Em cada botão de filtro: `onPointerDown` inicia timer de 300ms → se atingir, chama `onPreviewStart(filter.preview_css)` e seta flag para não disparar `onClick`
- `onPointerUp`/`onPointerLeave` chama `onPreviewEnd()` e limpa timer
- Se soltar antes de 300ms → é tap normal → dispara `onFilterClick`
- Mostrar hint "Segure p/ prévia" abaixo do grid (texto discreto)

**5. `src/components/customize/ImageControls.tsx` + `src/pages/Customize.tsx`**
- Passar `onPreviewStart`/`onPreviewEnd` pela cadeia até o `Customize.tsx`
- No `Customize.tsx`: estado `previewCssFilter: string | null`
- Passar para `PhonePreview` como nova prop `cssFilter`

**6. `src/components/PhonePreview.tsx`** — Aplicar CSS filter
- Nova prop `cssFilter?: string | null`
- Quando presente, aplicar `style={{ filter: cssFilter }}` na div da imagem atual
- Transição suave: `transition: filter 0.2s ease`

**7. `src/components/customize/FilterConfirmDialog.tsx`** — Simplificar
- Remover linhas "Seu saldo" e "Saldo após"
- Manter apenas custo: `🪙 {cost}`
- Manter lógica de saldo insuficiente

**8. `src/components/admin/AiFiltersManager.tsx`** — Campo `preview_css` no formulário admin

### Fluxo do usuário
1. Envia foto → aparece no phone
2. Vai em "Filtros IA" → vê grid de filtros
3. **Segura** um filtro → prévia CSS aparece no phone instantaneamente
4. **Solta** → volta ao normal
5. **Toca** (tap curto) → modal com custo `🪙 X` → confirma → gera via IA

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Coluna `preview_css` |
| `src/lib/customize-types.ts` | Tipo atualizado |
| `src/hooks/useCustomize.tsx` | Select atualizado |
| `src/components/customize/AiFiltersList.tsx` | Long-press logic |
| `src/components/customize/ImageControls.tsx` | Props passthrough |
| `src/pages/Customize.tsx` | Estado `previewCssFilter` |
| `src/components/PhonePreview.tsx` | Aplicar CSS filter |
| `src/components/customize/FilterConfirmDialog.tsx` | Simplificar modal |
| `src/components/admin/AiFiltersManager.tsx` | Campo admin |

