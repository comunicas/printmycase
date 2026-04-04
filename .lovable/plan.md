

## Filtros por Período, Ordenação e Detalhe de Usuário no Admin

### 1. Filtros por período de cadastro

Adicionar dois inputs de data (De/Até) na barra de filtros, usando `<input type="date" />` nativo (não há componente Calendar/Popover instalado e não vale instalar só para isso).

- States: `dateFrom: string`, `dateTo: string`
- Filtrar no `useMemo` junto com o search: `created_at >= dateFrom && created_at <= dateTo`
- Reset page quando datas mudam

### 2. Ordenação crescente/decrescente por coluna

Adicionar sort clicável nos headers da tabela (Cadastro, Coins, Pedidos, Nome).

- State: `sortKey: "created_at" | "full_name" | "coin_balance" | "order_count"`, `sortDir: "asc" | "desc"`
- Default: `created_at` desc (atual)
- Clicar no header alterna asc/desc; ícone `ArrowUpDown` / `ArrowUp` / `ArrowDown` do lucide
- Ordenação aplicada no `useMemo` após filtro de search + datas

### 3. Detalhe do usuário (pedidos + gerações)

Ao clicar numa linha da tabela, abrir um **Dialog** com os detalhes do usuário selecionado.

**Conteúdo do dialog:**
- Header: avatar, nome, email, telefone, data de cadastro, saldo de coins
- Tab "Pedidos": lista dos pedidos do usuário (query `orders` where `user_id = X`, com status, data, valor, produto)
- Tab "Gerações IA": grid das gerações do usuário (query `user_ai_generations` where `user_id = X`, com imagem, filtro, tipo, data)

**Implementação:**
- Novo componente `UserDetailDialog.tsx` que recebe `userId` e `open/onClose`
- Usa `Dialog` do shadcn existente + `Tabs` existente
- Fetch pedidos e gerações ao abrir (lazy load)
- Reutiliza `formatPrice`, `statusLabels`, `fmtDate`

### Arquivos

1. **Editar** `src/components/admin/UsersManager.tsx`:
   - Adicionar inputs de data e estados de sort
   - Tornar linhas clicáveis (`cursor-pointer`, `onClick`)
   - State `selectedUserId` para controlar dialog

2. **Criar** `src/components/admin/UserDetailDialog.tsx`:
   - Dialog com tabs Pedidos/Gerações
   - Queries lazy ao abrir

### Resultado
- Admin pode filtrar usuários por período de cadastro
- Pode ordenar por qualquer coluna clicando no header
- Pode clicar num usuário para ver seus pedidos e gerações em detalhe

