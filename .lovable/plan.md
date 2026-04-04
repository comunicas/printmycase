

## Adicionar Nome do Usuário, Filtros Aplicados e Custo em Coins nas Gerações

### O que será feito

Enriquecer cada card de geração no admin com:
1. **Nome do usuário** (vindo da tabela `profiles`)
2. **Nome do filtro IA aplicado** (já existe `filter_name`, mas precisa ser mais visível)
3. **Custo em coins** da geração (calculado com base em `coin_settings`: filtro = `ai_filter_cost`, upscale = `ai_upscale_cost`)

### Implementação

**Arquivo: `src/components/admin/UserGenerationsManager.tsx`**

1. **Alterar a query** para fazer JOIN com `profiles`:
   - Usar `.select("*, profiles!user_id(full_name)")` ou fazer uma query separada de profiles por batch de `user_id`s
   - Como o Supabase não tem FK declarada entre `user_ai_generations.user_id` e `profiles.id`, farei uma query separada para buscar nomes dos perfis por batch

2. **Buscar custos de coins** no mount:
   - Query em `coin_settings` para `ai_filter_cost` e `ai_upscale_cost`
   - Atualmente ambos valem 1 coin cada

3. **Atualizar o tipo `Generation`** para incluir `userName?: string`

4. **Atualizar o card** para exibir:
   - Nome do usuário no lugar de "Usuário: {id.slice(0,8)}…"
   - Lista de filtros aplicados (filter_name já existe, apenas tornar mais proeminente)
   - Badge com custo em coins (ex: "1 🪙" para filtro, "1 🪙" para upscale)

5. **Atualizar o lightbox** com as mesmas informações

### Detalhes técnicos
- Profiles serão buscados em batch: após carregar gerações, extrair `user_id`s únicos e fazer `SELECT id, full_name FROM profiles WHERE id IN (...)`
- Custos serão carregados uma vez via `useEffect` em `coin_settings`
- O tipo `original` não tem custo (0 coins)

### Resultado
- Admin vê claramente quem gerou, qual filtro usou, e quanto custou em coins
- 1 arquivo editado: `UserGenerationsManager.tsx`

