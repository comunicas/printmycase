

## Revisao Completa — Central de Ajuda

### Estado Atual

O modulo e composto por:

**Paginas publicas:**
- `/ajuda` — KnowledgeBase.tsx (listagem de categorias + busca)
- `/ajuda/:categorySlug` — KbCategory.tsx (lista artigos de uma categoria)
- `/ajuda/:categorySlug/:articleSlug` — KbArticle.tsx (artigo completo)
- FaqSection.tsx — FAQ accordion na landing page (featured FAQs)

**Admin:**
- KbCategoriesManager — CRUD de categorias
- KbArticlesManager — CRUD de artigos
- FaqManager — CRUD de FAQs com destaque e vinculo a artigos

**SEO:**
- Sitemap dinâmico inclui categorias e artigos KB
- BreadcrumbList JSON-LD em todas as 3 paginas
- FAQPage JSON-LD na home (FaqSection) e na pagina /ajuda
- Article JSON-LD na pagina de artigo
- setPageSeo (title, description, canonical, OG, Twitter) em todas as paginas
- llms.txt referencia /ajuda

---

### Bugs e Problemas Encontrados

**1. KbArticle: artigo nao valida se pertence a categoria da URL (BUG)**
A query busca o artigo apenas por `slug` e `active`, ignorando o `categorySlug` da URL. Se dois artigos tiverem o mesmo slug em categorias diferentes, mostra o errado. Alem disso, se alguem acessar `/ajuda/categoria-errada/artigo-real`, o artigo renderiza normalmente com breadcrumb incorreto.

**Correcao:** Buscar o article filtrado tambem por category_id (obtido da categoria).

**2. KbArticle e KbCategory: sem tratamento de 404**
Se o slug nao existe, a pagina fica vazia — sem mensagem de erro nem redirecionamento. O titulo permanece "Central de Ajuda | Studio PrintMyCase" do useEffect inicial.

**Correcao:** Mostrar estado "Artigo nao encontrado" com link de volta.

**3. KbCategory: sem tratamento quando categoria nao existe**
Se o slug e invalido, a pagina fica em branco apos o loading.

**4. FaqSection na landing: JSON-LD duplicado com KnowledgeBase**
Ambos injetam FAQPage JSON-LD. Se o usuario navegar da home para /ajuda, temporariamente temos 2 scripts FAQPage no DOM (o da home so e removido no cleanup). Nao e critico, mas o da home nao tem `data-seo` id unico usado pelo `injectJsonLd` (usa createElement direto).

**Correcao:** FaqSection deveria usar `injectJsonLd("faq-home", ...)` para consistencia. Ja usa `data-seo="faq-home"` mas nao usa a funcao utilitaria.

**5. KbArticle: query de artigo nao valida contra category_id**
A busca retorna qualquer artigo ativo com aquele slug, independente da categoria. Isso causa inconsistencia entre a URL e o conteudo exibido.

**6. KnowledgeBase: contagem de artigos faz query separada sem necessidade**
Busca todos os artigos ativos so para contar por categoria. Poderia usar uma view ou RPC, mas funciona — so e ineficiente com muitos artigos.

---

### Itens Importantes para SEO

**Ja implementado (OK):**
- Canonical URLs em todas as paginas
- BreadcrumbList JSON-LD (3 niveis)
- Article JSON-LD com dateModified, headline, author
- FAQPage JSON-LD na home e /ajuda
- Sitemap dinâmico com lastmod
- Meta description gerada do conteudo do artigo
- Internal linking: artigos relacionados, link "Leia mais" no FAQ
- llms.txt com referencia a /ajuda

**Faltando / Pode melhorar:**
- `<meta name="robots">` nao e definido (depende do default do framework)
- Artigos nao tem `datePublished` no JSON-LD (so dateModified)
- Nao ha `mainEntityOfPage` no Article JSON-LD
- Categorias KB nao tem JSON-LD proprio (CollectionPage ou ItemList seria ideal)
- Busca interna nao tem `SearchAction` JSON-LD no /ajuda
- Description da categoria no sitemap e meta poderia ser mais rica

---

### Plano de Correcoes

**Arquivo: `src/pages/KbArticle.tsx`**
1. Buscar artigo filtrando por `category_id` (obtido da query de categoria)
2. Adicionar estado 404 quando artigo ou categoria nao encontrados
3. Adicionar `datePublished` e `mainEntityOfPage` ao Article JSON-LD

**Arquivo: `src/pages/KbCategory.tsx`**
4. Adicionar estado 404 quando categoria nao encontrada
5. Injetar `ItemList` JSON-LD com os artigos da categoria

**Arquivo: `src/components/FaqSection.tsx`**
6. Usar `injectJsonLd` em vez de createElement manual (consistencia)

**Arquivo: `src/pages/KnowledgeBase.tsx`**
7. Adicionar `WebSite` + `SearchAction` JSON-LD para a busca interna

Nenhuma alteracao de banco de dados necessaria. Todas as correcoes sao no front-end.

