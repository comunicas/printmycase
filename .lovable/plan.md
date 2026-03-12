

## Correção: Imagens de referência quebradas no "Copiar Setup"

### Bug identificado

No edge function `generate-gallery-image`, as URLs de referência (`temp-refs/...`) são salvas na coluna `image_urls` da tabela `ai_generated_images`, mas logo após são **deletadas** pelo cleanup (linhas ~138-148). Resultado: ao clicar "Setup", as imagens aparecem como broken/404.

### Solução

**Edge Function (`supabase/functions/generate-gallery-image/index.ts`)**
- Em vez de deletar os arquivos `temp-refs/`, **movê-los** para `ref-images/` (path permanente) antes de salvar no DB.
- Atualizar as URLs no array `image_urls` para apontar para o novo path permanente antes do insert.
- Remover o bloco de cleanup de temp-refs.

### Fluxo corrigido

1. Frontend faz upload para `temp-refs/xxx.png`
2. Edge function recebe as URLs
3. Edge function copia cada `temp-refs/` para `ref-images/` (mesmo bucket)
4. Salva as URLs permanentes (`ref-images/`) no DB
5. Deleta os `temp-refs/` originais

### Arquivo alterado

| Arquivo | Alteração |
|---|---|
| `supabase/functions/generate-gallery-image/index.ts` | Mover temp-refs para ref-images antes do insert, salvar URLs permanentes |

