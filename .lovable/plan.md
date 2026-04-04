

## Corrigir Imagens Quebradas no Admin — Gerações de Usuários

### Diagnóstico

O banco de dados mostra que a maioria dos registros em `user_ai_generations` ainda tem **URLs assinadas expiradas** no campo `image_url` (contêm `/sign/` e `token=`). Isso acontece por dois motivos:

1. **Edge functions não foram re-deployadas** — o código foi atualizado para salvar URLs públicas, mas as funções deployadas ainda salvam signed URLs
2. **Admin UI não tem fallback** — `UserGenerationsManager` usa `img.image_url` diretamente, sem gerar nova signed URL quando a existente expira (ao contrário de `MyGenerations.tsx` que já tem esse fallback)
3. **Registros existentes** nunca foram migrados — a função `migrate-generation-urls` existe mas só processou 98 de 127+ registros

### Correções

**1. `src/components/admin/UserGenerationsManager.tsx`**
- Adicionar lógica de resolução de URLs: ao carregar imagens, detectar URLs expiradas (`/sign/` ou `token=`) e gerar nova signed URL via `storage_path`
- Aplicar tanto na grid quanto no lightbox
- Mesma lógica que já existe em `MyGenerations.tsx`

**2. Re-deploy das edge functions**
- Deploy `apply-ai-filter` e `upscale-image` para que novas gerações salvem URLs públicas permanentes
- Deploy `migrate-generation-urls` para migrar registros antigos

**3. Executar migração completa**
- Chamar `migrate-generation-urls` repetidamente até processar todos os registros restantes com signed URLs
- Isso corrige os dados existentes de forma permanente

### Resultado
- Imagens aparecem imediatamente no admin (fallback com signed URL fresh)
- Novas gerações já salvam URL pública permanente
- Registros antigos migrados para URLs permanentes

