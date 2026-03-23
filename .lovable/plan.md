

## Corrigir download + recuperar imagem filtrada

### Problema 1: Download abre na mesma janela
O `handleDownload` usa `a.href = src` com `a.download`, mas quando `src` é uma URL cross-origin (fal.ai), o atributo `download` é ignorado pelo navegador e a URL abre na mesma janela.

**Correção em `src/hooks/useCustomize.tsx` — `handleDownload` (linha 413-422)**:
- Fazer `fetch(src)` → `.blob()` → `URL.createObjectURL(blob)` → usar no `a.href`
- Após o click, revogar o object URL
- Tratar erro com fallback para `window.open(src, '_blank')`

### Problema 2: Não recupera a última imagem filtrada
Quando o usuário volta à página de customização, o draft restore (linhas 130-150) carrega apenas `edited_image_path` ou `original_image_path`, mas não restaura o estado `filteredImage` nem `activeFilterId`.

O `handleContinue` já salva `activeFilter` em `customization_data` e o `optimizedPath` é a imagem original (não a filtrada). A imagem filtrada em si não é salva separadamente no storage.

**Correção em `src/hooks/useCustomize.tsx`**:

1. **No `handleContinue` (linha ~472-479)**: Salvar também a imagem filtrada no storage quando `filteredImage` existe, e passar o path no `customization_data`:
   - Upload `filteredImage` como `pending_filtered_{ts}.jpg`
   - Incluir `filteredImagePath` no objeto passado ao `upsertPending`

2. **No restore de pending_checkouts (linhas 130-150)**: Além de restaurar a imagem base, verificar se `customization_data` contém `activeFilter` e `filteredImagePath`. Se sim:
   - Baixar a imagem filtrada via `getSignedUrl`
   - Setar `filteredImage`, `activeFilterId` e exibir a filtrada como imagem ativa

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useCustomize.tsx` | Download com blob + restaurar filteredImage do pending |

