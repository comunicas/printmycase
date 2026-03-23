

## Meta tags dinâmicas para páginas de coleção, design e catálogo

### Estado atual

- **Product.tsx**: Já possui SEO completo (title, description, og:image, canonical, JSON-LD) ✅
- **CollectionPage.tsx**: Sem meta tags ❌
- **DesignPage.tsx**: Sem meta tags ❌
- **Catalog.tsx**: Sem meta tags ❌

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/pages/CollectionPage.tsx` | Adicionar useEffect com SEO: title, description, og:title/description/image (cover_image), canonical, JSON-LD (CollectionPage com ItemList dos designs) |
| 2 | `src/pages/DesignPage.tsx` | Adicionar useEffect com SEO: title, description, og:image (design.image_url), product JSON-LD, canonical |
| 3 | `src/pages/Catalog.tsx` | Adicionar useEffect com SEO: title "Catálogo de Capas", description, canonical `/catalog` |
| 4 | `src/pages/Collections.tsx` | Adicionar useEffect com SEO: title "Coleções Exclusivas", description, canonical `/colecoes` |

### Padrão de implementação

Reutilizar o mesmo padrão `setMeta` + `canonical` + `JSON-LD` já usado em `Product.tsx`. Cada página define seu próprio `useEffect` com cleanup (remove script/canonical no unmount).

**CollectionPage** — JSON-LD `CollectionPage` com `ItemList` dos designs, og:image da `cover_image`.

**DesignPage** — JSON-LD `Product` com preço, og:image do `design.image_url`.

**Catalog/Collections** — Apenas meta tags básicas (title, description, og, canonical), sem JSON-LD dinâmico.

