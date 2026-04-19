
User quer que o botão "Finalizar Pedido" da página de Checkout fique fixo no rodapé do mobile (sticky bottom bar), padrão consagrado de e-commerce mobile que aumenta conversão.

Preciso confirmar: o usuário disse "produto colecoes" antes, mas agora está em `/colecao/creative/...`. O botão "Finalizar Pedido" existe em `src/pages/Checkout.tsx` (já vi no contexto). Vou aplicar lá.

## Botão "Finalizar Pedido" sticky no mobile — `/checkout/:id`

### Mudança em `src/pages/Checkout.tsx`

**1. Botão atual (estático no fluxo):**
```tsx
<Button className="w-full gap-1.5" onClick={handleCheckout} disabled={...}>
  Finalizar Pedido
</Button>
<PaymentBadges />
```

**2. Comportamento novo:**
- **Mobile (`lg:hidden`)**: barra fixa no rodapé com `position: fixed`, fundo `bg-background/95 backdrop-blur`, borda superior, padding com `safe-area-inset-bottom`. Mostra **total** à esquerda + botão "Finalizar" à direita (mesma ergonomia do Mercado Livre / Amazon mobile).
- **Desktop (`hidden lg:block`)**: mantém o botão inline atual (não polui telas grandes).
- Adicionar `pb-24 lg:pb-0` no `<main>` para o conteúdo não ficar atrás da barra fixa.
- `PaymentBadges` continua inline (acima da área do botão fixo).

### Layout da sticky bar mobile

```
┌─────────────────────────────────────┐
│ Total                               │
│ R$ 89,90    [ Finalizar Pedido → ] │
└─────────────────────────────────────┘
```

- Total em `text-sm text-muted-foreground` + valor em `text-base font-semibold`
- Botão `flex-1` à direita, mesmo handler/disabled/loading
- Z-index: `z-40` (abaixo de modais, acima do conteúdo)

### Arquivos
- `src/pages/Checkout.tsx` — apenas duplicar o botão em wrapper sticky mobile + esconder o inline no mobile + padding-bottom no main

### Fora de escopo
- Não mexer em `OrderSummary`, `AddressForm`, `PaymentBadges`
- Desktop continua exatamente igual
