# Remover método Pix dos fluxos

O método Pix está sendo exibido em dois lugares na UI, mas o checkout do Stripe não está oferecendo Pix de fato. Vou removê-lo de ambos.

## Locais identificados

1. **`src/pages/Checkout.tsx` (linhas 404-411)** — Card verde "Pix — aprovação imediata / Pague com QR Code ou copia e cola" no bloco "Forma de pagamento" (o item da imagem enviada).
2. **`src/components/PaymentBadges.tsx` (linhas 37-44)** — Selo SVG "Pix" exibido junto com Visa/Mastercard/Elo/Amex. Esse componente aparece em Landing, DesignPage, Checkout e CheckoutSuccess.

## Verificações feitas

- **Coins (`src/pages/Coins.tsx`)**: nenhuma menção a Pix. Sem alterações.
- **Customização e Coleções**: nenhuma menção a Pix. Sem alterações.
- **Edge functions (`create-checkout`, `create-coin-checkout`)**: não declaram `payment_method_types` com Pix (Stripe usa o padrão configurado na conta), então nada a alterar no backend.

## Mudanças

### 1. `src/pages/Checkout.tsx`
Remover o bloco do card verde de Pix (linhas 405-411), mantendo apenas o card de "Cartão de crédito" dentro do bloco "Forma de pagamento".

### 2. `src/components/PaymentBadges.tsx`
- Remover o `<svg>` do Pix (linhas 37-44).
- Atualizar o comentário "Card brands + Pix" para "Card brands".
- Os selos Visa, Mastercard, Elo e Amex permanecem.

## Resultado

A UI passa a refletir corretamente os métodos disponíveis (apenas cartão de crédito via Stripe), tanto no pré-checkout principal quanto nos selos de pagamento exibidos em Landing, Design, Checkout e CheckoutSuccess. Nenhum impacto nos fluxos de moedas, customização e coleções.