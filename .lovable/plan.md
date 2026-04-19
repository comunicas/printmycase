

## Análise + Limpeza de legados/bugs no sistema de Coleções e Designs

### Auditoria realizada

**Estado atual do banco:**
- 3 coleções ativas (Brasil, Creative, Design) — slugs já em lowercase ✅
- 14 designs ativos, todos com `image_url`, mas **0 com imagens extras** e **apenas 1 com descrição** (Pixel Bandeira)
- `sort_order` agora consistente (0..N por coleção) ✅

**Bugs e legados encontrados:**

| # | Onde | Problema | Severidade |
|---|------|----------|---|
| 1 | `CollectionsManager.tsx` linha 156 | Slug da coleção aceita texto cru sem sanitização (`setSlug(e.target.value)`) — usuário pode digitar "Hello World" e quebrar URL. `CollectionDesignsManager` já tem `slugify`, mas `CollectionsManager` não. | Alto |
| 2 | `CollectionsManager.tsx` linha 109 | Função de slug inline duplicada — não normaliza acentos (NFD) como o `slugify` do designs manager. "Coleção Verão" vira "cole-o-ver-o". | Alto |
| 3 | `CollectionsManager.tsx` | Sem campo de "Ativar/Desativar" no form (só toggle externo). OK, mas falta botão `Cancelar` no dialog. | Médio |
| 4 | `CollectionDesignsManager.tsx` | Falta botão `Cancelar`. Falta input de **preço em reais** (usuário hoje digita centavos — UX ruim, propenso a erro de R$ 89,90 vs 8990). | Alto |
| 5 | `CollectionDesignsManager.tsx` | Não exibe contador de imagens, nem permite reordenar a galeria. Sem limite máximo (usuário pode subir 100 imagens sem aviso). | Médio |
| 6 | `CollectionDesignsManager.tsx` linha 69 | `useEffect` inicial não tem `selectedCollectionId` no deps mas usa via closure stale — funciona por acaso porque só roda 1x. Bug latente. | Baixo |
| 7 | `DesignPage.tsx` linha 168 | Breadcrumb mostra `collectionSlug` cru ("brasil") em vez do nome real da coleção ("Brasil"). | Médio |
| 8 | `CollectionPage.tsx` linha 46 | JSON-LD do design usa `description` genérico em vez do campo real `d.description` do banco (não foi atualizado quando o campo foi adicionado). | Médio |
| 9 | `useCollectionDesigns.ts` linha 99-102 | Ordenação por `sort_order` da coleção faz `find()` em loop (O(n²)). Com poucos itens não impacta, mas é código frágil — `order("sort_order")` no select já bastaria. | Baixo |
| 10 | Slug de coleção `design` | Coleção chamada "Design" tem slug "design" — colide visualmente com termo genérico, e nenhum design está nela (0 designs ativos atribuídos). Provável legado. | Baixo (informativo) |

### Plano de execução

**Fase 1 — Refatorar utilitário `slugify`**
- Extrair `slugify()` para `src/lib/utils.ts` (ou novo `src/lib/slug.ts`) — versão única com NFD + lowercase + sanitização
- Substituir as 2 implementações inline em `CollectionsManager` e `CollectionDesignsManager`

**Fase 2 — Melhorias `CollectionsManager`**
- Aplicar `slugify()` no campo de slug (auto-normaliza ao digitar)
- Adicionar botão `Cancelar` no dialog
- Adicionar dica visual abaixo do slug: "URL: /colecao/{slug}"

**Fase 3 — Melhorias `CollectionDesignsManager`** (foco principal)
- **Campo de preço em reais** (R$): input decimal com máscara, conversão automática para centavos no save. Exibir centavos como info secundária
- Botão `Cancelar` no dialog
- Contador de imagens: "X/10 imagens" + limite máximo de 10 fotos extras (alerta se exceder)
- Reordenação de imagens extras via botões ↑/↓ (sem drag-and-drop para manter simples e sem nova dep)
- Indicador visual de qual imagem é a "capa" no preview da galeria (badge "Capa")
- Corrigir deps do `useEffect` inicial das coleções (linha 69) — incluir `selectedCollectionId` na lógica corretamente
- Mensagem de validação inline (não só toast) quando faltar campo obrigatório

**Fase 4 — Correções de exibição**
- `DesignPage`: buscar nome real da coleção via `useCollection(collectionSlug)` para breadcrumb correto
- `CollectionPage` JSON-LD: usar `d.description ?? fallback`
- `useCollectionDesigns`: simplificar ordenação adicionando `order("collections(sort_order)")` no select, ou ordenar via `Map` com lookup O(1)

**Fase 5 — Remover legado de coleção vazia (opcional, requer confirmação do usuário)**
- Coleção "Design" não tem designs. Vou apenas **listar** isso como aviso, não remover automaticamente — pode ser intencional.

### Arquivos modificados
- `src/lib/slug.ts` (novo) ou adicionar em `src/lib/utils.ts`
- `src/components/admin/CollectionsManager.tsx` (slugify + cancelar + dica URL)
- `src/components/admin/CollectionDesignsManager.tsx` (preço em R$ + cancelar + reorder + contador + cap)
- `src/pages/DesignPage.tsx` (breadcrumb com nome real)
- `src/pages/CollectionPage.tsx` (JSON-LD com description real)
- `src/hooks/useCollectionDesigns.ts` (ordenação O(1))

### Sem alterações no banco
Schema já está correto após a última migração. Apenas código.

### Risco
Baixo. Mudanças são UX/refactor sem impacto em dados ou contratos de API.

