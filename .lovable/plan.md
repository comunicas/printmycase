

## Correções Menores — Warnings de Ref

A Base de Conhecimento e o painel admin estão funcionais. Os únicos problemas são warnings do React sobre refs em componentes funcionais (`LoadingSpinner`, `KbCategory`). Não são erros críticos mas poluem o console.

### Correção

Nenhuma correção obrigatória. Os warnings ocorrem porque o React Router tenta passar refs para componentes de página. Se quiser eliminar os warnings:

- Envolver `KnowledgeBase`, `KbCategory` e `KbArticle` com `React.forwardRef` (opcional, cosmético)

### Verificação funcional

Tudo está operacional:
- CRUD de categorias e artigos no admin
- Toggle featured/active nas FAQs
- Páginas públicas `/ajuda`, listagem e artigos individuais
- Breadcrumbs e navegação
- FAQ filtrado na landing page

Não há bugs funcionais a corrigir.

