

## Otimizar FAQ JSON-LD na Home e na Central de Ajuda

### Situação atual

| Página | FAQ JSON-LD | Problema |
|--------|------------|----------|
| `/ajuda` (KnowledgeBase) | Injeta `FAQPage` com até 30 artigos da `kb_articles` | Usa títulos de artigos como perguntas e primeiros 300 chars do conteúdo como resposta — funciona, mas não são perguntas reais |
| Home (Landing) | **Nenhum** | O `FaqSection` renderiza as 5 FAQs featured da tabela `faqs` mas **não injeta JSON-LD** |
| `/ajuda/:categorySlug/:articleSlug` (KbArticle) | **Nenhum** | Artigos individuais não têm schema estruturado |

### Alterações

**1. FaqSection.tsx — Injetar FAQPage JSON-LD na Home**

Adicionar um `useEffect` que injeta o schema `FAQPage` com as 5 FAQs featured já carregadas. Usa a função `faqPageJsonLd` existente de `merchant-jsonld.ts`. Inclui cleanup no return.

**2. KnowledgeBase.tsx — Usar FAQs reais em vez de artigos**

Alterar a lógica para buscar da tabela `faqs` (perguntas e respostas reais) em vez de usar títulos de `kb_articles` como proxy. Isso garante que o schema tenha perguntas genuínas no formato pergunta/resposta que o Google espera.

**3. KbArticle.tsx — Adicionar schema Article + BreadcrumbList**

Injetar JSON-LD com:
- `@type: Article` (headline, dateModified, author: Studio PrintMyCase)
- `@type: BreadcrumbList` (Home → Central de Ajuda → Categoria → Artigo)

Isso melhora a indexação de artigos individuais e habilita breadcrumbs nos resultados de busca.

**4. KnowledgeBase.tsx — Adicionar meta tags SEO**

Usar `setPageSeo` de `src/lib/seo.ts` para definir title, description, canonical e OG tags na página `/ajuda`.

**5. KbArticle.tsx — Adicionar meta tags SEO**

Usar `setPageSeo` para definir title/description dinâmicos baseados no título e conteúdo do artigo.

### Detalhes técnicos

- Nenhuma alteração no banco de dados
- 3 arquivos modificados: `FaqSection.tsx`, `KnowledgeBase.tsx`, `KbArticle.tsx`
- Reutiliza `faqPageJsonLd` e `setPageSeo` já existentes
- Todos os scripts JSON-LD incluem cleanup no `useEffect` return para evitar duplicação na navegação SPA

