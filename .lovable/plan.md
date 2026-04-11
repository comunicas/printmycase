

## Auto-preencher Thumbnails do Instagram via oEmbed

### Problema
Os 5 posts existentes no banco estão sem `thumbnail_url`. O Instagram bloqueia scraping direto (403), mas oferece um **endpoint oEmbed público** (`https://api.instagram.com/oembed?url=...`) que retorna `thumbnail_url` sem necessidade de token.

### Plano

**1. Criar edge function `fetch-instagram-thumbnail`**
- Recebe `{ post_id, post_url }` ou pode processar todos os posts sem thumbnail
- Faz `fetch("https://api.instagram.com/oembed?url=${post_url}")` server-side
- Extrai `thumbnail_url` da resposta JSON
- Atualiza o registro na tabela `instagram_posts` via service role
- Rota admin-only (verifica role)

**2. Adicionar botão no admin `InstagramPostsManager.tsx`**
- Botão "Buscar Thumbnails" no topo que chama a edge function para todos os posts sem thumbnail
- Botão individual por post (ícone de refresh) para re-buscar uma thumbnail específica
- Feedback visual: loading spinner + toast de sucesso/erro

**3. Processar os 5 posts existentes**
- Após deploy da edge function, o admin clica "Buscar Thumbnails" e todos os posts são preenchidos automaticamente

### Detalhes técnicos

**Resposta do oEmbed API:**
```json
{
  "thumbnail_url": "https://scontent-...",
  "thumbnail_width": 640,
  "thumbnail_height": 640,
  "title": "...",
  "author_name": "printmycasebr"
}
```

**Edge function:** `supabase/functions/fetch-instagram-thumbnail/index.ts`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para update na tabela
- Processa todos posts onde `thumbnail_url IS NULL` quando chamada sem `post_id`

**Fallback:** Se o oEmbed falhar para algum post (privado, deletado), mostra erro no toast e o admin pode colar a URL manualmente como já funciona hoje.

