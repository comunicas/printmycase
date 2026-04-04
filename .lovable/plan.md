
## Resumo de Coins por Usuário + Paginação na Tab de Gerações

### Mudanças

**1. Substituir infinite scroll por paginação tradicional**
- Remover `IntersectionObserver`, `sentinelRef`, `offsetRef`, `hasMore`
- Usar paginação server-side com `page` state e `range(from, to)` no Supabase
- Buscar count total com `select("*", { count: "exact", head: true })` para calcular `totalPages`
- Reutilizar o componente `Pagination` já existente em `src/components/admin/Pagination.tsx`
- PAGE_SIZE = 12 (grid visual)

**2. Adicionar resumo/totalizador de coins gastos por usuário**
- Nova query separada no mount: buscar todas as gerações agrupadas por `user_id` e `generation_type`, contando ocorrências
- Calcular coins gastos: `count(filter) * ai_filter_cost + count(upscale) * ai_upscale_cost`
- Exibir um painel resumo no topo com cards:
  - Total de gerações
  - Total de coins gastos (global)
  - Top 5 usuários por gasto (nome + coins)
- Buscar nomes dos top users via `profiles`

### Arquivo editado
- `src/components/admin/UserGenerationsManager.tsx`

### Detalhes técnicos
- A query de resumo será: `SELECT user_id, generation_type, count(*) FROM user_ai_generations GROUP BY user_id, generation_type` — feita via RPC ou query simples iterando resultados
- Como não temos RPC para agregação, faremos `select("user_id, generation_type")` com limit alto (1000) e agregaremos no client
- Paginação: a query principal usa `.range(page * PAGE_SIZE, (page+1) * PAGE_SIZE - 1)` com count exact para total
