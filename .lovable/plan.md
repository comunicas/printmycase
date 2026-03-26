

## Revisão SEO Completa — Branding, Silos e Structured Data

### Auditoria atual

| Página | setPageSeo | JSON-LD Product/Collection | BreadcrumbList | Branding correto |
|--------|-----------|---------------------------|----------------|-----------------|
| Home (`SeoHead`) | ✅ | ✅ ItemList | ❌ | ❌ "PrintMyCase" |
| `/catalog` | ✅ | ❌ nenhum | ❌ | ❌ "PrintMyCase" |
| `/product/:slug` | ✅ | ✅ Product | ✅ | ❌ "PrintMyCase" |
| `/colecoes` | ✅ | ✅ CollectionPage+ItemList | ❌ | ❌ "PrintMyCase" |
| `/colecao/:slug` | ✅ | ✅ CollectionPage+ItemList | ❌ | ❌ "PrintMyCase" |
| `/colecao/:s/:d` (Design) | ✅ | ✅ Product | ❌ | ❌ "PrintMyCase" |
| `/ajuda` | ✅ | ✅ FAQPage | ❌ | ✅ |
| `/ajuda/:cat` | ❌ nenhum | ❌ | ❌ | ❌ |
| `/ajuda/:cat/:art` | ✅ | ✅ Article | ✅ | ✅ |

**Produtos individuais (`/product/:slug`) já têm Product schema completo** com `sku`, `brand`, `offers`, `aggregateRating`, `shippingDetails` e `returnPolicy`. Estão OK.

**Designs individuais (`/colecao/:s/:d`) também têm Product schema** com `sku`, `brand`, `offers`. OK.

### O que precisa ser feito

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `SeoHead.tsx` | `SITE_NAME` → "Studio PrintMyCase", `TITLE` → "Studio PrintMyCase \| Capas Personalizadas...", URL fallback → `studio.printmycase.com.br` |
| 2 | `Catalog.tsx` | Title → "...Studio PrintMyCase", adicionar BreadcrumbList (Home → Catálogo) |
| 3 | `Product.tsx` | `SITE_NAME` → "Studio PrintMyCase" (BreadcrumbList já existe) |
| 4 | `Collections.tsx` | Title/DESC → "Studio PrintMyCase", adicionar BreadcrumbList (Home → Coleções) |
| 5 | `CollectionPage.tsx` | `SITE_NAME` → "Studio PrintMyCase", adicionar BreadcrumbList (Home → Coleções → Nome) |
| 6 | `DesignPage.tsx` | `SITE_NAME` → "Studio PrintMyCase", adicionar BreadcrumbList (Home → Coleções → Coleção → Design) |
| 7 | `KbCategory.tsx` | Adicionar `setPageSeo` + BreadcrumbList (Home → Ajuda → Categoria) |
| 8 | `KnowledgeBase.tsx` | Adicionar BreadcrumbList (Home → Central de Ajuda) |
| 9 | `KbArticle.tsx` | Adicionar seção "Artigos relacionados" — até 3 links para artigos da mesma categoria (internal linking) |
| 10 | `seo.ts` | Atualizar fallback URL para `studio.printmycase.com.br` |

### Detalhes técnicos

- **10 arquivos** modificados, nenhuma alteração no banco
- Branding unificado: toda constante `SITE_NAME` passa para `"Studio PrintMyCase"`
- BreadcrumbList segue padrão já usado em `Product.tsx` — array de `ListItem` com `position`, `name`, `item`
- Internal linking no `KbArticle`: query adicional buscando até 3 artigos da mesma `category_id` (excluindo o atual), renderizados como cards com link
- Todas as injeções JSON-LD usam `useEffect` com cleanup para evitar duplicação na navegação SPA

