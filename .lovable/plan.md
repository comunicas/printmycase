

## Prerender para Crawlers (WhatsApp, Facebook, LinkedIn)

### O Problema

Como o app é uma SPA (Single Page Application) servida estaticamente pelo Lovable, crawlers que **não executam JavaScript** (WhatsApp, Facebook, LinkedIn, Telegram) sempre veem as meta tags estáticas do `index.html` — nunca as dinâmicas injetadas via `useEffect`.

### Solução

Criar uma edge function `prerender` que gera HTML mínimo com as meta tags corretas para cada rota pública, e configurar um proxy reverso (Cloudflare Worker) no domínio customizado para rotear crawlers para essa função.

```text
Crawler (WhatsApp/Facebook)
  → studio.printmycase.com.br/colecao/Creative/heck-yeah
  → Cloudflare Worker detecta bot pelo User-Agent
  → Proxy para edge function "prerender?path=/colecao/Creative/heck-yeah"
  → Retorna HTML com og:title, og:image, og:description corretos

Usuário normal
  → Cloudflare Worker detecta browser normal
  → Serve a SPA normalmente (sem mudança)
```

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `supabase/functions/prerender/index.ts` | Nova edge function que recebe `?path=...`, identifica a rota (produto, coleção, design, catálogo, etc.), busca dados no banco e retorna HTML mínimo com todas as meta tags OG/Twitter corretas |

### Como funciona a edge function

1. Recebe o path da URL (ex: `/colecao/Creative/heck-yeah`)
2. Faz pattern matching para identificar o tipo de página:
   - `/product/:slug` → busca produto
   - `/colecao/:slug` → busca coleção
   - `/colecao/:col/:design` → busca design
   - `/colecoes` → página estática de coleções
   - `/catalog` → página estática de catálogo
   - `/` → landing page
3. Busca os dados relevantes do banco (título, descrição, imagem)
4. Retorna HTML com:
   - `og:title`, `og:description`, `og:image`, `og:url`
   - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
   - `<meta http-equiv="refresh">` para redirecionar usuários normais para a SPA
   - Cache de 1 hora

### Configuração do proxy (manual, fora do Lovable)

Após a edge function estar deployada, será necessário configurar um Cloudflare Worker (ou similar) no domínio `studio.printmycase.com.br` que:
- Detecta bots pelo User-Agent (facebookexternalhit, WhatsApp, LinkedInBot, TelegramBot, Twitterbot)
- Redireciona a requisição para a edge function com o path original
- Para todos os outros requests, serve normalmente

Fornecerei o código do Worker como referência.

### Limitação

A configuração do Cloudflare Worker é externa ao Lovable e precisa ser feita manualmente no painel do Cloudflare (ou equivalente do provedor DNS usado).

