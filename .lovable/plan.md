

## Backfill das Imagens Públicas Existentes

### Problema
As 3 gerações marcadas como `public = true` foram criadas antes do campo `public_image_url`. Ambas têm `public_image_url = null` e `image_url` com signed URLs expiradas. A galeria fica vazia.

### Solução

Como as signed URLs já expiraram, não podemos fazer download delas. Mas as imagens ainda existem no bucket `customizations` — o `storage_path` está salvo na tabela. A solução é:

| # | Ação | Detalhe |
|---|------|---------|
| 1 | Refatorar `UserGenerationsManager.tsx` | No toggle para `public = true`, em vez de fazer fetch da signed URL (que pode expirar), usar `supabase.storage.from('customizations').download(storage_path)` para baixar diretamente do bucket privado, e depois fazer upload para `product-assets/galleries/public/{id}.jpg`. Isso funciona porque o admin autenticado tem acesso ao bucket. |
| 2 | Criar botão de backfill no admin | Adicionar um botão "Reprocessar imagens públicas" que busca todas as gerações com `public = true AND public_image_url IS NULL`, faz download via `storage_path` e upload para o bucket público. |
| 3 | Alternativa simples | O admin pode desmarcar e remarcar cada geração como pública — o novo código (passo 1) vai funcionar porque usa `storage_path` em vez da signed URL. |

### Correção no toggle (passo 1)

```text
Antes:  fetch(image_url) → pode falhar se expirada
Depois: storage.download(storage_path) → sempre funciona para admin
```

### Decisão

O passo 1 é obrigatório (corrigir o toggle). O passo 2 (botão backfill) é um nice-to-have. Após o passo 1, o admin pode simplesmente toggle off/on nas 3 gerações existentes.

