

# Adicionar seletor de status nos pedidos do Admin

## O que muda

No tab "Pedidos" do painel admin, substituir o badge estático de status por um `<select>` dropdown que permite o admin alterar o status do pedido diretamente. Ao mudar, faz `UPDATE` na tabela `orders` via Supabase e exibe toast de confirmação.

## Detalhes técnicos

### `src/pages/Admin.tsx`

1. Atualizar `statusLabels` para incluir os novos status (`analyzing`, `customizing`, `producing`).

2. Substituir o `<span>` do status (linha 304-306) por um `<select>` com as opções:
   - `pending` → Pendente
   - `analyzing` → Em Análise
   - `customizing` → Customizando
   - `producing` → Produzindo
   - `shipped` → Enviado
   - `delivered` → Entregue
   - `cancelled` → Cancelado

3. Adicionar handler `handleStatusChange(orderId, newStatus)` que:
   - Faz `supabase.from("orders").update({ status: newStatus }).eq("id", orderId)`
   - Exibe toast de sucesso/erro
   - Atualiza a lista local de pedidos (otimistic update ou refetch)

4. Quando o status mudar para `shipped`, manter o comportamento existente do tracking code (já presente).

### Nenhuma migração necessária
A RLS já permite admins atualizarem pedidos (`Admins can update orders`), e os novos valores do enum já existem no banco.

