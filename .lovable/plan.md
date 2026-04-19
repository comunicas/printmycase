
## Implementar 7 melhorias SEO restantes em Coleções/Designs

### Contexto
Auditoria anterior identificou 7 melhorias para alinhar o SEO de `/colecoes`, `/colecao/:slug` e `/colecao/:slug/:designSlug` ao padrão já maduro de produtos (`/capa-celular/:brand/:slug`). Vou aplicar nas 3 páginas mais o sitemap.

### Mudanças

**1. `src/pages/DesignPage.tsx` — JSON-LD Product completo**
- Adicionar `inLanguage: "pt-BR"` no `@graph`
- Adicionar `category: "Capas para Celular"` no Product
- Adicionar `aggregateRating` (usar 4.9 / count fixo da coleção, ou herdar do produto base — vou puxar do `useProducts` se já carregado, senão valores default da marca)
- Garantir `merchantOffer()` (já existe via `BRAND`, conferir uso)
- Adicionar `BreadcrumbList`: Home → Coleções → {Coleção} → {Design}

**2. `src/pages/CollectionPage.tsx` — JSON-LD CollectionPage + ItemList**
- `@type: CollectionPage` com `inLanguage: "pt-BR"`
- `ItemList` com os designs da coleção (position, name, url, image)
- `BreadcrumbList`: Home → Coleções → {Coleção}

**3. `src/pages/Collections.tsx` — JSON-LD CollectionPage índice**
- `@type: CollectionPage` com `inLanguage: "pt-BR"`
- `ItemList` com todas as coleções
- `BreadcrumbList`: Home → Coleções

**4. `src/lib/merchant-jsonld.ts` — helper `aggregateRatingDefault`**
- Exportar helper `defaultAggregateRating(rating?, count?)` retornando objeto `AggregateRating` com fallback (ex: 4.9 / 50) para evitar duplicação

**5. `src/pages/Product.tsx` — adicionar `inLanguage` e `category` (consistência)**
- Já tem `category`, falta `inLanguage: "pt-BR"` no `@graph`

**6. `src/components/SeoHead.tsx` (Landing) — adicionar `inLanguage`**
- Adicionar `inLanguage: "pt-BR"` no graph raiz (Organization/WebSite)

**7. `supabase/functions/sitemap/index.ts` — `<xhtml:link rel="alternate" hreflang="pt-BR">`**
- Adicionar namespace xhtml no `<urlset>`
- Para cada `<url>`, incluir `<xhtml:link rel="alternate" hreflang="pt-BR" href="..."/>` reforçando idioma único (sinaliza Brasil ao Google)

### Sem alterações de schema
Sem novas dependências. Cleanup de scripts JSON-LD via `useEffect` return em todas as páginas (padrão já estabelecido).

### Validação pós-implementação
- `curl` no `/sitemap` confirmando `xhtml:link`
- `curl` no `/prerender?path=/colecao/...` confirmando JSON-LD novo
- Validador estrutural via Rich Results (sugestão pro usuário)
