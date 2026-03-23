

## Code Review e Refatoração — Customização

### Problemas encontrados

| # | Arquivo | Problema |
|---|---------|----------|
| 1 | `AiFiltersManager.tsx` | Campo `preview_css` ainda presente no admin (estado, formulário, insert/update). A prévia agora usa `style_image_url`, não CSS — campo é legado e confunde |
| 2 | `AiFiltersManager.tsx` | Interface local `AiFilter` inclui `preview_css` — inconsistente com o tipo global em `customize-types.ts` |
| 3 | `UpscaleConfirmDialog.tsx` | Variável `remaining` (linha 29) usada mas com UI verbosa (saldo/custo/saldo após). Simplificar para manter consistência com `FilterConfirmDialog` (apenas custo) |
| 4 | `useCustomize.tsx` | `handleDownload` chama `fetch(src)` em data URLs — funciona mas é ineficiente. Deve verificar se é data URL antes do fetch |
| 5 | `ContinueBar.tsx` | Toast de download dispara antes do download realmente concluir (o `onDownload` é async mas não é await) |
| 6 | `PhonePreview.tsx` | Import `Sparkles` não usado (removido do JSX em refatorações anteriores? Não — é usado no badge) — na verdade é usado, ok |

### Plano de refatoração

**1. `src/components/admin/AiFiltersManager.tsx`** — Remover legado `preview_css`
- Remover estado `previewCss` e `setPreviewCss`
- Remover campo FormField "Preview CSS" do dialog (linhas 334-337)
- Remover `preview_css` do insert/update/openEdit/openNew
- Remover da interface local `AiFilter`
- O campo continua no banco (sem migração destrutiva) mas o admin não o expõe mais

**2. `src/components/customize/UpscaleConfirmDialog.tsx`** — Simplificar modal
- Remover variável `remaining` não usada
- Simplificar para mostrar apenas custo `🪙 {cost} moedas` (igual ao FilterConfirmDialog)
- Remover linhas "Seu saldo" e "Saldo após"

**3. `src/hooks/useCustomize.tsx` — `handleDownload`** — Otimizar para data URLs
- Se `src` começa com `data:`, converter direto para blob via `fetch(src)` (já funciona)
- Mas o toast no ContinueBar dispara antes do async completar — mover toast para dentro do `handleDownload` (retornar Promise) e remover toast do ContinueBar

**4. `src/components/customize/ContinueBar.tsx`** — Corrigir timing do toast
- `handleDownload` deve `await onDownload()` antes de mostrar feedback
- Mover toast para `useCustomize.handleDownload` e fazer `ContinueBar` apenas aguardar

**5. `ARCHITECTURE.md`** — Atualizar após mudanças

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/AiFiltersManager.tsx` | Remover `preview_css` (estado, form, queries) |
| `src/components/customize/UpscaleConfirmDialog.tsx` | Simplificar para custo apenas |
| `src/hooks/useCustomize.tsx` | `handleDownload` retorna Promise |
| `src/components/customize/ContinueBar.tsx` | `await onDownload()` + mover toast |

