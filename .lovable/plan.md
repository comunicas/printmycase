

# Alteração de preços em massa (Bulk Price Update)

## Resumo
Adicionar funcionalidade no painel admin para selecionar múltiplos produtos e aplicar uma alteração de preço em massa — por valor fixo ou percentual — atualizando o banco de dados e sincronizando com o Stripe automaticamente.

## UX proposta

Na aba "Produtos", adicionar:
1. **Checkbox** em cada linha da tabela + checkbox "selecionar todos" no header
2. **Barra de ações em massa** que aparece quando há produtos selecionados, contendo:
   - Dropdown para tipo de ajuste: "Valor fixo (R$)" ou "Percentual (%)"
   - Input para o valor (ex: `5,00` ou `10`)
   - Botões "+/-" para aumentar ou diminuir
   - Botão "Aplicar" com confirmação
   - Contador de selecionados: "3 produtos selecionados"

```text
[✓] Selecionar todos    |  3 selecionados
┌─────────────────────────────────────────────────┐
│  Ajuste: [Percentual ▼]  Valor: [10]           │
│  [+ Aumentar]  [- Diminuir]  [Aplicar]         │
└─────────────────────────────────────────────────┘
```

## Fluxo
1. Admin seleciona produtos via checkbox
2. Escolhe tipo (fixo/percentual) e valor
3. Clica em "Aumentar" ou "Diminuir"
4. Dialog de confirmação mostra preview: nome, preço atual → preço novo
5. Ao confirmar: atualiza `price_cents` no DB para cada produto e chama `admin-sync-stripe` com `action: "update_price"` para os que têm `stripe_product_id`

## Arquivos afetados

### 1. `src/components/admin/ProductsTable.tsx`
- Adicionar coluna de checkbox
- Checkbox no header para selecionar todos
- Props: `selectedIds`, `onSelectionChange`

### 2. `src/components/admin/BulkPriceDialog.tsx` (novo)
- Dialog de confirmação com preview de preços antigos → novos
- Lógica de aplicação (update DB + sync Stripe por produto)

### 3. `src/pages/Admin.tsx`
- Estado de seleção (`selectedIds`)
- Barra de ações em massa com inputs de ajuste
- Integração com `BulkPriceDialog`

