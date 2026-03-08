

## Refatoração do Painel Admin

### Problemas encontrados

1. **Admin.tsx monolítico (446 linhas)** — Produtos e Pedidos estão inline no arquivo principal enquanto FAQ, Filtros IA, Solicitações e Moedas foram extraídos para componentes separados. Inconsistência arquitetural.

2. **Tipo `DbOrder` redundante** — Define interface manual duplicando `Tables<"orders">` do types.ts gerado automaticamente. Mesmo antipadrão removido da página Orders.

3. **Múltiplos `<h1>` na mesma página** — Cada tab renderiza seu próprio `<h1>` ("Produtos", "Pedidos", "Perguntas Frequentes", etc). Deveria haver um único `<h1>` "Painel Admin" e cada seção usar `<h2>`.

4. **Tabs overflow no mobile** — 6 tabs em `TabsList` horizontal sem scroll. Em telas pequenas os triggers ficam comprimidos/cortados.

5. **`(supabase as any)` em CoinsManager e AiFiltersManager** — Casts forçados indicam que as tabelas `coin_settings`, `coin_transactions` e `ai_filters` não estão sendo reconhecidas pelo tipo gerado. Provavelmente são tabelas válidas mas o cast esconde erros silenciosamente.

6. **`confirm()` nativo** — FaqManager, AiFiltersManager e ModelRequestsManager usam `window.confirm()` para exclusões. Inconsistente com o padrão de Dialog usado no resto do app.

7. **Pedidos sem paginação** — Lista cresce infinitamente no admin também.

8. **Lógica de produtos inline** — `fetchProducts`, mapeamento de rows, bulk state — tudo poderia estar num componente `ProductsManager` para consistência com as outras seções.

### Alterações propostas

**Arquivo: `src/pages/Admin.tsx`**

1. **Extrair `OrdersManager`** — mover toda a lógica de pedidos (fetch, status change, tracking, filter chips, cards) para `src/components/admin/OrdersManager.tsx`
2. **Extrair `ProductsManager`** — mover lógica de produtos (fetch, bulk price, sync, dialogs) para `src/components/admin/ProductsManager.tsx`
3. **Admin.tsx vira shell** — apenas AppHeader + `<h1>` + Tabs com imports dos managers
4. **`<h1>` único** — "Painel Admin" no topo; cada manager usa `<h2>` para seu título
5. **Tabs responsivas** — adicionar `overflow-x-auto` no TabsList para scroll horizontal no mobile

**Arquivo: `src/components/admin/OrdersManager.tsx` (novo)**

6. **Remover `DbOrder`** — usar `Tables<"orders">` com campos enriched
7. **Paginação** — `PAGE_SIZE = 10`, controles de página
8. **Cards de pedido** — manter layout atual, apenas extraído

**Arquivo: `src/components/admin/ProductsManager.tsx` (novo)**

9. **Encapsular toda lógica de produtos** — fetch, bulk state, sync, toggle active, dialogs

**Arquivos: `FaqManager`, `AiFiltersManager`, `ModelRequestsManager`, `CoinsManager`**

10. **`<h1>` → `<h2>`** — corrigir hierarquia de headings em todos
11. **Remover `(supabase as any)`** — usar cast tipado `supabase.from("ai_filters")` etc. Se o tipo não reconhecer, ignorar o erro de tipo com comentário (melhor que `as any` que esconde bugs reais)
12. **`confirm()` → Dialog de confirmação** — criar componente `ConfirmDialog` reutilizável e usar nos 3 managers que fazem delete

**Arquivo: `src/components/admin/ConfirmDialog.tsx` (novo)**

13. **Dialog de confirmação padrão** — props: `open`, `onConfirm`, `onCancel`, `title`, `description`, `destructive`

### Resultado

```text
Antes (Admin.tsx = 446 linhas):
  Admin.tsx: Products inline + Orders inline + imports dos outros managers

Depois (Admin.tsx ≈ 60 linhas):
  Admin.tsx: Shell (h1 + Tabs)
  ├── ProductsManager.tsx (extraído)
  ├── OrdersManager.tsx (extraído)
  ├── FaqManager.tsx (h2 + ConfirmDialog)
  ├── AiFiltersManager.tsx (h2 + ConfirmDialog, sem "as any")
  ├── ModelRequestsManager.tsx (h2 + ConfirmDialog)
  ├── CoinsManager.tsx (h2, sem "as any")
  └── ConfirmDialog.tsx (novo, reutilizável)
```

### Arquivos alterados
- `src/pages/Admin.tsx` — reduzir para shell
- `src/components/admin/ProductsManager.tsx` — novo, extraído
- `src/components/admin/OrdersManager.tsx` — novo, extraído
- `src/components/admin/ConfirmDialog.tsx` — novo, reutilizável
- `src/components/admin/FaqManager.tsx` — h2 + ConfirmDialog
- `src/components/admin/AiFiltersManager.tsx` — h2 + ConfirmDialog + remover `as any`
- `src/components/admin/ModelRequestsManager.tsx` — h2 + ConfirmDialog
- `src/components/admin/CoinsManager.tsx` — h2 + remover `as any`

