

## Arquitetura SEO de Silos: /capa-celular/

### Resumo
Criar 3 níveis de páginas indexáveis com URLs descritivas, breadcrumbs e JSON-LD, usando os produtos existentes sem alterações no banco de dados. A marca é derivada do nome do produto (já existe `extractBrand`), e o slug do produto serve como identificador do modelo.

### Estrutura de URLs

```text
/capa-celular/                          → Página pilar (todas as marcas)
/capa-celular/iphone/                   → Hub Apple
/capa-celular/samsung/                  → Hub Samsung
/capa-celular/motorola/                 → Hub Motorola
/capa-celular/xiaomi/                   → Hub Xiaomi
/capa-celular/outros/                   → Hub outros
/capa-celular/iphone/iphone-15-pro-max/ → Página do modelo (= produto)
```

### Alterações

**1. `src/lib/brand-seo.ts`** — Mapeamento de marcas
- Mapa de brand display name → slug SEO: `{ Apple: "iphone", Samsung: "samsung", Motorola: "motorola", Xiaomi: "xiaomi", Outro: "outros" }`
- Helper `brandFromSlug(slug)` → retorna display name
- Helper `brandSlug(displayName)` → retorna slug
- Textos SEO por marca (title, description, H1) para meta tags otimizadas

**2. `src/pages/BrandCategoryPage.tsx`** — Nível 1: `/capa-celular/`
- Lista todas as marcas disponíveis como cards com imagem representativa e contagem de modelos
- H1: "Capas de Celular Personalizadas"
- Links internos para cada marca (`/capa-celular/iphone/`, etc.)
- JSON-LD: `ItemList` + `BreadcrumbList` (Home > Capas de Celular)
- SEO: title "Capas de Celular Personalizadas | Studio PrintMyCase"

**3. `src/pages/BrandPage.tsx`** — Nível 2: `/capa-celular/:brand/`
- Filtra produtos pela marca usando `extractBrand`
- H1: "Capas para iPhone" / "Capas para Samsung" etc.
- Grid de modelos com link para nível 3
- JSON-LD: `ItemList` com produtos da marca + `BreadcrumbList`
- SEO: title "Capas para iPhone Personalizadas | Studio PrintMyCase"
- 404 se slug de marca inválido

**4. `src/pages/BrandModelPage.tsx`** — Nível 3: `/capa-celular/:brand/:model/`
- Busca produto por slug (`:model`)
- Reutiliza componentes `ProductGallery`, `ProductInfo`, `ProductDetails`
- Botão CTA "Personalizar Agora" → `/customize/:slug`
- JSON-LD: `Product` com `offers`, `brand`, `aggregateRating` + `BreadcrumbList` completo
- SEO: title "Capa iPhone 15 Pro Max Personalizada | Studio PrintMyCase"
- Canonical aponta para esta URL (não para `/product/:slug`)
- 404 se produto não encontrado ou marca não bate

**5. `src/App.tsx`** — Novas rotas
```
/capa-celular         → BrandCategoryPage
/capa-celular/:brand  → BrandPage
/capa-celular/:brand/:model → BrandModelPage
```

**6. `src/pages/Product.tsx`** — Redirect/canonical
- Adicionar `<link rel="canonical">` apontando para `/capa-celular/:brand/:slug` em vez de `/product/:slug`
- Isso sinaliza ao Google qual URL é a principal

**7. `supabase/functions/sitemap/index.ts`** — URLs do silo
- Adicionar `/capa-celular/` (priority 0.9)
- Adicionar `/capa-celular/:brand/` para cada marca com produtos ativos (priority 0.8)
- Adicionar `/capa-celular/:brand/:slug/` para cada produto (priority 0.8, com lastmod)
- Manter URLs `/product/:slug` no sitemap com priority menor (0.5) ou remover

**8. Links internos**
- `src/components/AppHeader.tsx` ou nav: adicionar link "Capas" → `/capa-celular/`
- `src/pages/Landing.tsx`: seção de modelos populares com links para as páginas de marca
- `ProductCard.tsx`: link principal passa a apontar para `/capa-celular/:brand/:slug`

### Sem alterações no banco de dados
A marca é derivada de `extractBrand(product.name)` que já existe. O slug do produto (`product.slug`) serve como `:model`. Nenhuma migração necessária.

### Benefícios SEO
- URLs descritivas e hierárquicas para crawlers
- Breadcrumbs estruturados em JSON-LD em todos os níveis
- Páginas indexáveis para termos como "capa iphone 15", "capinha samsung galaxy a55"
- Internal linking forte entre níveis do silo
- Canonical definido para evitar duplicidade com `/product/:slug`

