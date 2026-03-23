

## Sitemap.xml dinâmico via Edge Function

### Abordagem

Um sitemap estático no `public/` não incluiria páginas dinâmicas (produtos, coleções, artigos). Melhor criar um edge function que gera o sitemap.xml dinamicamente, consultando o banco para listar todas as URLs de produtos, coleções, designs e artigos.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `supabase/functions/sitemap/index.ts` | **Novo** — Edge function que gera XML do sitemap. Consulta `products`, `collections`, `collection_designs`, `kb_categories`, `kb_articles` e combina com rotas estáticas |
| 2 | `public/robots.txt` | Adicionar `Sitemap: https://printmycase.com.br/sitemap.xml` |
| 3 | `vite.config.ts` | Adicionar proxy `/sitemap.xml` → edge function (para dev). Em produção, configurar redirect no hosting ou acessar direto via URL da function |

### Rotas no sitemap

**Estáticas** (prioridade alta):
- `/`, `/catalog`, `/customize`, `/colecoes`, `/ajuda`, `/solicitar-modelo`, `/termos`, `/privacidade`, `/compras`

**Dinâmicas** (do banco):
- `/product/{slug}` — todos os produtos ativos
- `/colecao/{slug}` — todas as coleções ativas
- `/colecao/{collSlug}/{designSlug}` — todos os designs ativos
- `/ajuda/{catSlug}` — categorias do KB
- `/ajuda/{catSlug}/{artSlug}` — artigos do KB

**Excluídas** (autenticadas/admin):
- `/orders`, `/profile`, `/coins`, `/admin`, `/minhas-geracoes`, `/login`, `/signup`, `/reset-password`

### Formato de saída

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://printmycase.com.br/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>https://printmycase.com.br/product/iphone-15</loc><priority>0.8</priority></url>
  ...
</urlset>
```

