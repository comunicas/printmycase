

# Corrigir nome do arquivo no upload

## Problema
Na linha 86, o upload renomeia o arquivo para `gallery-{timestamp}-{random}.{ext}`, perdendo o nome original. O usuário quer manter o nome original do arquivo.

## Correção

### `src/components/admin/ProductImagesUpload.tsx`
- **Linha 86**: Trocar o path de `${id}/gallery-${Date.now()}-...` para `${id}/${file.name}` (nome original do arquivo)
- Para evitar colisões de nomes duplicados, usar `upsert: true` (já está configurado) ou adicionar um sufixo curto apenas quando necessário

