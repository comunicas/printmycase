
## Configurar Cloudflare Worker para prerender

### Status

A edge function `prerender` já está deployada. Falta configurar o proxy no Cloudflare para rotear crawlers.

### Código do Cloudflare Worker

Criar um Worker no domínio `studio.printmycase.com.br` com este código:

```javascript
const BOT_AGENTS = /facebookexternalhit|WhatsApp|LinkedInBot|TelegramBot|Twitterbot|Slackbot|Discordbot|embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|vkShare|W3C_Validator|redditbot/i;

const EDGE_FN_URL = "https://iqnqpwnbdqzvqssxcxgb.supabase.co/functions/v1/prerender";

export default {
  async fetch(request) {
    const ua = request.headers.get("user-agent") || "";
    const url = new URL(request.url);

    // Only intercept bot requests on public routes
    if (BOT_AGENTS.test(ua) && isPublicRoute(url.pathname)) {
      const prerenderUrl = `${EDGE_FN_URL}?path=${encodeURIComponent(url.pathname)}`;
      return fetch(prerenderUrl);
    }

    // All other requests pass through to origin
    return fetch(request);
  }
};

function isPublicRoute(path) {
  return path === "/" ||
    path === "/catalog" ||
    path === "/colecoes" ||
    path.startsWith("/colecao/") ||
    path.startsWith("/product/");
}
```

### Passos manuais

1. No Cloudflare Dashboard → Workers & Pages → Create Worker
2. Colar o código acima
3. Em Workers → Routes, adicionar: `studio.printmycase.com.br/*`
4. Testar compartilhando um link de produto no WhatsApp
