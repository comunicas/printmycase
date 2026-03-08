

## Refatoração da Página de Pedidos

### Problemas encontrados

1. **Tipo `OrderRow` redundante** — duplica campos já definidos em `Tables<"orders">` do types.ts gerado automaticamente
2. **Labels de status duplicados** — `statusFlow` redefine labels que já existem em `src/lib/constants.ts` (`statusLabels`)
3. **Timeline de status ilegível no mobile** — 7 steps com `min-w-[56px]` cada = 392px mínimo, estoura em telas pequenas e fica comprimido
4. **Sem filtro por status** — todos os pedidos misturados (pendentes, entregues, cancelados)
5. **Sem paginação** — lista cresce infinitamente
6. **Seção "Pedidos pendentes" confusa** — mistura pending_checkouts (rascunhos) com orders de status "pending", nomenclatura ambígua

### Alterações propostas

**Arquivo: `src/pages/Orders.tsx`**

1. **Remover tipo `OrderRow`** — usar `Tables<"orders">` diretamente, estender com campos enriched
2. **Usar `statusLabels` de constants.ts** — eliminar duplicação de labels no `statusFlow`
3. **Simplificar timeline no mobile** — mostrar apenas o step atual com texto descritivo + barra de progresso (proporção `currentStep/total`), em vez de 7 ícones comprimidos
4. **Adicionar filtro por tabs** — "Ativos" (pending→producing), "Enviados" (shipped/delivered), "Cancelados" — usando Tabs do Radix
5. **Paginação client-side** — `PAGE_SIZE = 8`, controles idênticos ao padrão do Catálogo e Moedas
6. **Renomear seção** — "Pedidos pendentes" → "Rascunhos" para distinguir de orders com status pending

**Arquivo: `src/components/PendingCheckoutCards.tsx`**

7. **Renomear título** — "Pedidos pendentes" → "Rascunhos de customização"

**Arquivo: `src/lib/constants.ts`**

8. **Adicionar `statusIcons`** — mapa de ícones por status, centralizado, para reutilização

### Detalhes visuais — Timeline simplificada

```text
Antes (7 ícones comprimidos):
[💳][💳][🔍][🎨][🏭][🚚][✅]

Depois (progresso compacto):
🏭 Produzindo          ━━━━━━━━░░░  4/7
```

O step atual é mostrado com ícone + label + barra de progresso proporcional. Ocupa uma linha, legível em qualquer tela.

### Arquivos alterados
- `src/pages/Orders.tsx` — tipos, tabs, paginação, timeline compacta
- `src/components/PendingCheckoutCards.tsx` — rename título
- `src/lib/constants.ts` — adicionar `statusIcons`

