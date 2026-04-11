

## Vitrine Instagram Minimalista — Apenas o Vídeo/Imagem

### Problema

O embed nativo do Instagram (`embed.js`) renderiza o post completo com curtidas, comentários, avatar, caption, link "View this post on Instagram", etc. **Não existe versão minimalista oficial** — o Instagram não oferece parâmetros para esconder esses elementos.

### Solução

Abandonar o embed nativo e construir cards próprios. Para isso, precisamos de uma URL de thumbnail/mídia para cada post. Duas abordagens possíveis:

**Abordagem escolhida: campo `thumbnail_url` manual na tabela**

Adicionar um campo `thumbnail_url` à tabela `instagram_posts`. O admin cola a URL da thumbnail ao cadastrar o post. O card exibe apenas a imagem/thumbnail com um ícone de play (se for vídeo) e ao clicar abre o post no Instagram.

Isso é simples, sem dependência de APIs externas, e dá controle total sobre o visual.

### Alterações

**1. Migration — adicionar coluna `thumbnail_url`**
```sql
ALTER TABLE public.instagram_posts ADD COLUMN thumbnail_url text;
```

**2. `src/components/InstagramShowcase.tsx`** — reescrever completamente
- Remover todo o código de `embed.js` (blockquote, loadEmbedScript, InstaEmbed)
- Cards minimalistas: apenas a imagem (`thumbnail_url`) em aspect-ratio quadrado com `object-cover`, rounded corners
- Overlay sutil com ícone do Instagram no hover/mobile
- Click no card → `window.open(post_url)` abrindo o post no Instagram
- Manter lazy loading com IntersectionObserver
- Layout: scroll horizontal no mobile, grid 3 colunas no desktop
- Manter link `@printmycasebr` no rodapé

**3. `src/components/admin/InstagramPostsManager.tsx`** — adicionar campo
- Novo input "URL da Thumbnail" no formulário de criação/edição
- Preview da imagem ao lado do input

### Visual dos cards

```text
┌─────────────────┐
│                  │
│   [thumbnail]    │  ← aspect-square, object-cover, rounded-xl
│                  │
│        ▶ 📷     │  ← ícone Instagram sutil no canto (overlay)
└─────────────────┘
      tap → abre post no Instagram
```

Sem curtidas, sem caption, sem avatar, sem bordas extras — apenas a mídia pura.

### Detalhes técnicos
- O `thumbnail_url` pode ser obtido manualmente: abrir o post no navegador, copiar a URL da imagem/vídeo thumbnail
- Posts sem `thumbnail_url` preenchido continuam funcionando com um placeholder genérico
- O script `embed.js` do Instagram é completamente removido, melhorando a performance da landing page (menos JS de terceiro)

