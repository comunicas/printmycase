

## Ajustar Fluxo de Status dos Pedidos

### Mudanças no fluxo

Remover `customizing` (não faz mais parte do fluxo) e adicionar `rejected` (imagem recusada pelo admin).

**Fluxo novo:**
```text
pending → paid → analyzing → producing → shipped → delivered
                      ↓
                  rejected
```

**Labels novos:**
| Valor | Label |
|-------|-------|
| pending | Pagamento Pendente |
| paid | Pagamento Confirmado |
| analyzing | Analisando Imagem |
| rejected | Imagem Recusada |
| producing | Produzindo |
| shipped | Transporte |
| delivered | Entregue |
| cancelled | Cancelado |

### Arquivos

**1. Migration SQL** — Adicionar valor `rejected` ao enum `order_status`
```sql
ALTER TYPE order_status ADD VALUE 'rejected' AFTER 'analyzing';
```

**2. `src/lib/constants.ts`**
- Atualizar `statusLabels`: remover `customizing`, adicionar `rejected`, renomear labels conforme tabela acima
- Atualizar `statusIcons`: remover `customizing`, adicionar `rejected` (ícone `XCircle` ou `Ban`)
- Atualizar `statusFlow`: remover `customizing`, ficando `["pending", "paid", "analyzing", "producing", "shipped", "delivered"]`
- `rejected` e `cancelled` ficam fora do `statusFlow` (são desvios, não parte do fluxo linear)

**3. `src/components/admin/OrderDetailDialog.tsx`**
- Adicionar cor para `rejected` no `statusColorMap` (vermelho/laranja)
- A timeline já ignora statuses fora do `statusFlow`, então `rejected` aparecerá apenas no badge
- Adicionar indicação visual quando status é `rejected` (similar ao "Pedido cancelado")

**4. `src/components/admin/OrdersManager.tsx`**
- Adicionar cor para `rejected` no `statusColorMap` do card compacto

### Resultado
- Fluxo simplificado de 6 etapas (sem "Customizando")
- Novo status "Imagem Recusada" disponível para admin
- Labels em português mais descritivos
- 1 migration + 3 arquivos editados

