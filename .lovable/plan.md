

## Implementar Paginação em Todas as Listas do Admin

### Análise do Estado Atual

**Já têm paginação:**
- `OrdersManager` — paginação client-side (PAGE_SIZE=10)
- `UserGenerationsManager` — infinite scroll
- `AiGenerationsManager` — infinite scroll

**Precisam de paginação (renderizam tudo de uma vez):**
1. `ProductsTable` — lista de produtos (pode crescer muito)
2. `ModelRequestsManager` — solicitações de modelo
3. `CoinsManager` — transações (limit 200, sem paginação visual)
4. `AiFiltersManager` — filtros IA
5. `FaqManager` — perguntas FAQ
6. `KbArticlesManager` — artigos KB
7. `KbCategoriesManager` — categorias KB
8. `CollectionsManager` — coleções
9. `CollectionDesignsManager` — designs de coleção
10. `CoinPackagesManager` — pacotes de moedas
11. `GalleryImagesManager` — imagens ilustrativas
12. `ImageGalleriesManager` — galerias custom (lista + imagens dentro)
13. `AiFilterCategoriesManager` — categorias de filtros
14. `LegalDocsManager` — documentos legais

### Abordagem

Criar um **componente reutilizável `Pagination`** e um **hook `usePagination`** para evitar duplicar lógica em cada manager.

### Implementação

**1. Novo componente: `src/components/admin/Pagination.tsx`**
- Botões "Anterior" / "Próximo" + indicador "Página X de Y"
- Props: `page`, `totalPages`, `onPageChange`
- Aparece apenas quando `totalPages > 1`

**2. Novo hook: `src/hooks/usePagination.ts`**
- Recebe array de items e `pageSize` (default 10)
- Retorna `{ paginated, page, setPage, totalPages }`
- Reset automático para página 0 quando items mudam

**3. Integrar em cada manager (14 arquivos)**
- Importar `usePagination` + `Pagination`
- Passar a lista filtrada (se houver filtro) pelo hook
- Renderizar `paginated` ao invés do array completo
- Adicionar `<Pagination />` após a lista

**PAGE_SIZE por manager:**
- Listas com cards detalhados (Products, Orders, Requests, Transactions, Filters, FAQs, Articles): **10 por página**
- Grids visuais (Designs, Gallery Images, Custom Gallery Images): **12 por página**
- Listas curtas (Categories, Legal, Coin Packages): **10 por página**

### Resultado
- 2 novos arquivos (Pagination + usePagination)
- 14 managers editados
- UX consistente com navegação por páginas em todas as tabs

