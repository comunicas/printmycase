

## Refinamento de UX: Checkout + Página de Sucesso

### Contexto
O usuário quer melhorar a experiência visual e informacional do rodapé do checkout (abaixo do botão "Finalizar Pedido"), a página de sucesso pós-pagamento, e exibir o consumo de coins quando filtros IA foram aplicados.

### 1. Checkout — Rodapé com PaymentBadges e info de coins

**`src/pages/Checkout.tsx`**:
- Adicionar abaixo do botão "Finalizar Pedido" o componente `PaymentBadges` (selos Stripe, bandeiras, Pix, cadeado)
- Mostrar uma linha informativa no `OrderSummary` quando `customization.activeFilter` está presente, indicando que coins foram consumidos na geração (ex: "🪙 Filtro IA aplicado — coins já debitados")

**`src/components/checkout/OrderSummary.tsx`**:
- Receber prop opcional `aiFilterApplied: boolean`
- Se true, exibir uma linha sutil com ícone de moeda: "Filtro IA aplicado (coins debitados)"
- Manter o layout existente, apenas adicionar a linha antes do total

### 2. Página de Sucesso — Enriquecer com data, prazo e selo Stripe

**`src/pages/CheckoutSuccess.tsx`**:
- Buscar também `created_at`, `shipping_cents`, `status` da order além de `product_id` e `total_cents`
- Exibir **data do pedido** formatada (ex: "7 de março de 2026")
- Separar **produto** e **frete** no resumo (como no OrderSummary do checkout)
- Manter o prazo estimado "5 a 7 dias úteis" com ícone de relógio
- Adicionar `PaymentBadges` no rodapé do card (abaixo dos botões), reforçando a confiança pós-compra
- Se `customization_data.activeFilter` existir, mostrar a linha de coins consumidos

### 3. Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `src/components/checkout/OrderSummary.tsx` | Prop `aiFilterApplied`, linha de coins |
| `src/pages/Checkout.tsx` | Passar `aiFilterApplied`, adicionar `PaymentBadges` abaixo do botão |
| `src/pages/CheckoutSuccess.tsx` | Buscar mais campos, exibir data, frete separado, PaymentBadges, coin info |

### Fluxo Visual (Checkout)

```text
┌─────────────────────────────┐
│  📦 Mini preview   [Editar] │
├─────────────────────────────┤
│  📍 Endereço de entrega     │
├─────────────────────────────┤
│  🚛 Resumo do pedido        │
│  Produto         R$ 99,90   │
│  Frete           R$ 12,90   │
│  🪙 Filtro IA (debitado)    │ ← novo, condicional
│  ─────────────────────────  │
│  Total          R$ 112,80   │
├─────────────────────────────┤
│  [   Finalizar Pedido →   ] │
│                             │
│  🔒 Pagamento 100% seguro   │ ← PaymentBadges
│  Visa MC Elo Amex Pix       │
│  ── Powered by Stripe ──    │
└─────────────────────────────┘
```

### Fluxo Visual (Sucesso)

```text
┌─────────────────────────────┐
│       [Logo ArtisCase]      │
│          ✅                  │
│    Pedido Confirmado!       │
│  Pagamento processado...    │
├─────────────────────────────┤
│  [img] Capa Motorola edge   │
│         R$ 99,90            │
│  ─────────────────────────  │
│  Produto         R$ 99,90   │
│  Frete           R$ 12,90   │
│  Total          R$ 112,80   │
│  🪙 Filtro IA aplicado      │ ← condicional
│  ─────────────────────────  │
│  📅 7 de março de 2026      │
│  ⏱ Prazo: 5-7 dias úteis   │
│  Ref: cs_live_abc...        │
├─────────────────────────────┤
│ [Meus Pedidos] [Catálogo]   │
│                             │
│  🔒 Pagamento 100% seguro   │
│  Visa MC Elo Amex Pix       │
│  ── Powered by Stripe ──    │
└─────────────────────────────┘
```

