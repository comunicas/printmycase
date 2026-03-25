

## Ajustar SEO dinâmico das páginas públicas

### Diagnóstico

As páginas já injetam meta tags via `useEffect`, mas há inconsistências — algumas não definem `og:image`, `twitter:card` ou `twitter:image`. O `index.html` tem tags OG estáticas do landing page que servem como fallback.

**Páginas com meta tags incompletas:**

| Página | og:image | og:type | twitter:card | twitter:image |
|--------|----------|---------|--------------|---------------|
| Catalog (`/catalog`) | ❌ | ❌ | ❌ | ❌ |
| Collections (`/colecoes`) | ❌ | ✅ | ❌ (card) | ❌ |
| CollectionPage (`/colecao/:slug`) | ✅ | ✅ | ❌ (card) | ✅ |
| DesignPage (`/colecao/:s/:d`) | ✅ | ✅ | ✅ | ✅ |
| Product (`/product/:id`) | ✅ | ✅ | ✅ | ✅ |

### Limitação importante

Como o app é SPA (client-side rendering), crawlers que **não executam JavaScript** (WhatsApp, Facebook, LinkedIn) verão sempre as tags estáticas do `index.html`. O Google executa JS e lê as tags dinâmicas. Para resolver isso de forma completa, seria necessário um serviço de prerender (fora do escopo atual).

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/pages/Catalog.tsx` | Adicionar `og:image` (usar a social image padrão ou primeira imagem de produto), `og:type: website`, `twitter:card: summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` |
| 2 | `src/pages/Collections.tsx` | Adicionar `og:image` (usar cover da primeira coleção ou fallback), `twitter:card: summary_large_image`, `twitter:image` |
| 3 | `src/pages/CollectionPage.tsx` | Adicionar `twitter:card: summary_large_image` |
| 4 | Extrair helper `setMetaTags` | Criar um utilitário `src/lib/seo.ts` com a função `setMeta` reutilizável e uma função `setPageSeo({ title, description, image, url, type })` para eliminar duplicação em todas as páginas |

### Estrutura do helper

```typescript
// src/lib/seo.ts
export function setPageSeo(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string; // default "website"
}) {
  document.title = opts.title;
  // sets: description, og:title, og:description, og:image, og:url, og:type
  // sets: twitter:card, twitter:title, twitter:description, twitter:image
  // sets/creates canonical link
  // returns cleanup function for useEffect
}
```

Todas as 5 páginas públicas passam a usar `setPageSeo()`, garantindo consistência e eliminando ~15 linhas duplicadas por página.

