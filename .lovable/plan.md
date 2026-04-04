

## Adicionar Lista de Usuários Cadastrados no Admin

### Onde colocar
Nova tab "Usuários" no painel admin, entre "Pedidos" e "Coleções". Ícone: `Users` do lucide-react.

### O que exibir
- Tabela com: Nome, Email, Telefone, Data de cadastro, Saldo de coins, Qtd de pedidos
- Busca por nome/email
- Paginação (PAGE_SIZE = 10)
- Card resumo no topo: total de usuários cadastrados

### Como buscar os dados
- `profiles` table: id, full_name, phone, avatar_url, created_at (admin já tem SELECT via RLS)
- Email: vem de `auth.users` que não é acessível via client SDK. Solução: criar uma **edge function** `admin-list-users` que usa `supabase.auth.admin.listUsers()` com service role key e retorna id + email, mapeando com profiles no frontend
- Saldo de coins: usar a função `get_coin_balance(user_id)` existente, ou calcular client-side a partir de `coin_transactions`
- Qtd de pedidos: query em `orders` agrupada por `user_id`

### Arquivos
1. **Nova edge function**: `supabase/functions/admin-list-users/index.ts` — retorna lista de auth users (id, email, created_at) com verificação de admin role
2. **Novo componente**: `src/components/admin/UsersManager.tsx` — tabela de usuários com busca e paginação
3. **Editar**: `src/pages/Admin.tsx` — adicionar tab "Usuários"

### Fluxo de dados
```text
UsersManager mount
  ├─ fetch edge fn admin-list-users → { id, email, created_at }[]
  ├─ fetch profiles (full_name, phone, avatar_url)
  ├─ fetch coin_transactions (agregar saldo por user)
  ├─ fetch orders count por user
  └─ merge tudo por user_id → render tabela
```

