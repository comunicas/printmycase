

## Corrigir URL do Sitemap

### Problema

O `robots.txt` aponta para `https://printmycase.com.br/sitemap.xml`, mas o sitemap é um edge function — não existe arquivo estático nesse path. O Google Search Console mostra o domínio `studio.printmycase.com.br`, então a URL precisa apontar para o edge function.

Além disso, o `SITE_URL` dentro do edge function usa `printmycase.com.br`, mas as URLs do sitemap devem usar o domínio correto do site.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `public/robots.txt` | Trocar URL do Sitemap para: `https://iqnqpwnbdqzvqssxcxgb.supabase.co/functions/v1/sitemap` |
| 2 | `supabase/functions/sitemap/index.ts` | Trocar `SITE_URL` de `https://printmycase.com.br` para `https://studio.printmycase.com.br` |

### Nota

Após a aprovação, será necessário **publicar** o app para que o Google Search Console consiga acessar o `robots.txt` atualizado e o sitemap via edge function.

