

# Filtros por status no admin + correção de acesso aos pedidos

## Bug Critico Encontrado

A tabela `orders` não possui policy de SELECT para admins. Apenas usuários podem ver seus próprios pedidos (`user_id = auth.uid()`). Isso significa que o admin **não consegue listar nenhum pedido** no painel. A query retorna vazio silenciosamente.

## Mudanças

### 1. Migração: adicionar RLS policy de leitura para admins

```sql
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

### 2. `src/pages/Admin.tsx` — filtros e exibição de produto

- Adicionar state `statusFilter` (default `"all"`).
- Renderizar barra de filtro com botões/chips para cada status do `statusLabels`, mais "Todos".
- Filtrar a lista `orders` pelo status selecionado antes de renderizar.
- Enriquecer os pedidos com nome e imagem do produto (mesma lógica do `Orders.tsx` — buscar products por id/slug e mapear).
- Exibir thumbnail (40x40) e nome do produto em cada card de pedido.
- Mostrar contador de pedidos por status nos chips do filtro.

### 3. `src/pages/Orders.tsx` — revisão

- Adicionar realtime subscription para atualizar pedidos quando o status mudar no admin (usando `supabase.channel`).
- Isso garante que o usuário veja a mudança de status sem recarregar a página.

## Arquivos afetados
- Migração SQL (nova policy)
- `src/pages/Admin.tsx`
- `src/pages/Orders.tsx`

