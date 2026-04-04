

## Analise Critica do Plano + Plano por Fases

### Riscos Identificados no Plano Original

**RISCO ALTO — Remover `customizing` do enum do banco:**
- O `types.ts` (auto-gerado) lista `customizing` como valor válido do enum `order_status`
- Se existirem pedidos antigos com status `customizing` no banco, a migration de remoção do enum vai **falhar** ou causar perda de dados
- Renomear enums no Postgres é uma operação destrutiva (criar novo tipo, migrar coluna, dropar antigo) — se der erro no meio, a tabela `orders` fica inacessível
- O `types.ts` NÃO pode ser editado manualmente — ele se regenera após a migration. Se a migration falhar, o frontend quebra

**RISCO MEDIO — `statusColorMap` duplicado:**
- Centralizar é correto, mas se esquecer de atualizar algum import, componente para de renderizar o badge

**RISCO BAIXO — Limpeza do `stripe-webhook`:**
- Edge function isolada, sem impacto no frontend se falhar

### Plano Revisado em 3 Fases (menor risco)

---

### Fase 1 — Limpeza segura do frontend (sem migration)

Mudanças que não dependem de alteração no banco e não quebram nada:

1. **`src/lib/constants.ts`** — Adicionar `statusColorMap` exportado e tipo `AdminOrderRow`
2. **`src/components/admin/OrdersManager.tsx`** — Remover `statusColorMap` local e `OrderRow` local, importar de `constants`
3. **`src/components/admin/OrderDetailDialog.tsx`** — Idem, remover duplicatas e importar de `constants`
4. **`src/components/admin/AdminSidebar.tsx`** — Remover import `BookOpen` não usado
5. **`src/pages/Orders.tsx`** — Remover `"customizing"` da lista `activeStatuses` (L25). Seguro porque nenhum pedido novo vai ter esse status e, se algum antigo tiver, ele simplesmente não aparece na aba "ativos" — mas continua acessível na aba "todos"

**Validação:** Verificar que admin e meus pedidos carregam normalmente

---

### Fase 2 — Atualizar edge function + documentação

1. **`supabase/functions/stripe-webhook/index.ts`** — Remover `customizing` dos maps de labels/colors, adicionar `rejected` com label "Imagem Recusada" e cor laranja
2. **`ARCHITECTURE.md`** — Atualizar enum `order_status` (remover `customizing`, adicionar `rejected`), documentar `AdminSidebar`, `UsersManager`, `UserDetailDialog`, `OrderDetailDialog`, novo layout sidebar

**Validação:** Deploy da edge function + conferir que webhooks do Stripe continuam processando

---

### Fase 3 — Migration do enum (condicional)

**Pré-requisito:** Verificar se existem pedidos com `status = 'customizing'` no banco. Se existirem, primeiro fazer migration para migrar esses pedidos para `analyzing` (o equivalente mais próximo).

1. **Migration 1 (se necessário):** `UPDATE orders SET status = 'analyzing' WHERE status = 'customizing';`
2. **Migration 2:** Remover `customizing` do enum `order_status` usando a técnica de swap:
   ```sql
   ALTER TYPE order_status RENAME TO order_status_old;
   CREATE TYPE order_status AS ENUM('pending','paid','analyzing','rejected','producing','shipped','delivered','cancelled');
   ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::text::order_status;
   DROP TYPE order_status_old;
   ```

**Se não quisermos o risco:** podemos simplesmente **manter** `customizing` no enum do banco (ele não atrapalha nada) e só garantir que o frontend não o usa. Isso é a abordagem mais segura.

**Validação:** Conferir que `types.ts` se regenerou sem `customizing`, que nenhum insert/update quebra

---

### Resumo de Arquivos por Fase

| Fase | Arquivos | Risco |
|------|----------|-------|
| 1 | `constants.ts`, `OrdersManager.tsx`, `OrderDetailDialog.tsx`, `AdminSidebar.tsx`, `Orders.tsx` | Baixo |
| 2 | `stripe-webhook/index.ts`, `ARCHITECTURE.md` | Baixo |
| 3 | 1-2 migrations SQL | Medio-Alto |

### Recomendação

Executar Fases 1 e 2 juntas (são seguras). Para a Fase 3, recomendo **não remover o enum** do banco — apenas ignorar `customizing` no frontend. O valor fica "morto" no enum mas não causa nenhum problema funcional, e evita o risco de uma migration destrutiva.

