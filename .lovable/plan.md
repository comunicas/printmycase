

## Refatoração da Página de Produto — SEO + UX

### Problemas encontrados

1. **Sem SEO por produto** — `SeoHead` só injeta metatags genéricas da landing. A página `/product/:slug` não define `<title>`, `og:title`, `og:image`, canonical nem JSON-LD `Product` específico
2. **Breadcrumb sem marca** — hierarquia é `Catálogo > Produto`, deveria ser `Catálogo > Marca > Produto` para refletir a taxonomia real e melhorar structured data
3. **Galeria: imagem principal com `loading="lazy"`** — a imagem hero do produto deveria ter `loading="eager"` (LCP)
4. **Galeria: `max-w-md` limita desktop** — no layout 50/50, a galeria fica menor que o espaço disponível por causa do `max-w-md`
5. **Galeria: crash se `allImages` vazio** — `allImages[0]` seria `undefined`, sem fallback
6. **`forwardRef` desnecessário** — `ProductInfo` e `ProductDetails` usam `forwardRef` mas nenhum componente pai passa ref; overhead sem uso
7. **Descrição duplicada** — `ProductInfo` mostra `product.description` e `ProductDetails` mostra novamente na tab "Descrição"
8. **Falta JSON-LD `BreadcrumbList`** — structured data de breadcrumb ajuda no SEO e rich snippets do Google

### Alterações propostas

**Arquivo: `src/pages/Product.tsx`**

1. **SEO completo por produto** — `useEffect` que injeta:
   - `document.title` = `"Capa {nome} | ArtisCase"`
   - `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`
   - `<link rel="canonical">` = `/product/{slug}`
   - JSON-LD `Product` com `name`, `image`, `offers`, `aggregateRating`, `brand`
   - JSON-LD `BreadcrumbList` com hierarquia Catálogo → Marca → Produto
   - Cleanup no unmount
2. **Breadcrumb com marca** — `Catálogo > {Marca} > {Nome}`, usando `extractBrand` já existente; link da marca aponta para `/catalog?brand={brand}`
3. **Remover `forwardRef`** de `ProductInfo` e `ProductDetails` — simplificar para componentes funcionais normais

**Arquivo: `src/components/ProductGallery.tsx`**

4. **Imagem principal `eager`** — `loading="eager"` na imagem selecionada (index 0), `lazy` nas miniaturas
5. **Remover `max-w-md`** — deixar a galeria ocupar 100% do container
6. **Fallback para lista vazia** — se `allImages.length === 0`, mostrar placeholder

**Arquivo: `src/components/ProductInfo.tsx`**

7. **Remover `forwardRef`** — componente funcional simples
8. **Remover descrição duplicada** — manter descrição apenas em `ProductDetails`

**Arquivo: `src/components/ProductDetails.tsx`**

9. **Remover `forwardRef`** — componente funcional simples
10. **Default tab "specs"** se não houver descrição — evitar tab vazia

### Hierarquia SEO resultante

```text
Landing (/)
  └─ Catálogo (/catalog)
       └─ [Marca] (/catalog?brand=Motorola)
            └─ Produto (/product/motorola-edge-50-pro)

BreadcrumbList JSON-LD:
  1. Catálogo → /catalog
  2. Motorola → /catalog?brand=Motorola
  3. Capa Motorola Edge 50 Pro (current)

Product JSON-LD:
  @type: Product
  name, image, offers, aggregateRating, brand
```

### Arquivos alterados
- `src/pages/Product.tsx` — SEO, breadcrumbs com marca
- `src/components/ProductGallery.tsx` — eager loading, remover max-w-md, fallback
- `src/components/ProductInfo.tsx` — remover forwardRef, remover descrição duplicada
- `src/components/ProductDetails.tsx` — remover forwardRef, default tab inteligente

