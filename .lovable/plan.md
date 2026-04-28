# Remover menções restantes a Pix

Há três menções residuais ao método Pix que precisam sair:

## 1. `src/pages/Landing.tsx` (linha 246) — Card "03 Receba em casa"
De: `"Impressão premium e entrega rápida em todo o Brasil. Pix, cartão ou boleto."`
Para: `"Impressão premium e entrega rápida em todo o Brasil."`

## 2. `src/components/home/TechQualitySection.tsx` (linha 14) — pill na seção Impressão
De: `{ icon: <CreditCard ... />, label: 'Pix em 1 clique' }`
Para: `{ icon: <CreditCard ... />, label: 'Cartão em 1 clique' }`

## 3. FAQ no banco — pergunta "Quais formas de pagamento são aceitas?"
Migração SQL atualizando a resposta da linha `id = 'ffce01fd-7a18-45ff-83b4-c1e9cbb8af59'` na tabela `public.faqs`:

De: `Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express) e Pix. Todos os pagamentos são processados de forma segura pelo Stripe.`
Para: `Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express). Todos os pagamentos são processados de forma segura pelo Stripe.`

## Resultado

Toda a UI pública (LP "Como funciona", seção Impressão e FAQ) deixa de mencionar Pix, alinhando com a remoção já feita no pré-checkout e nos selos de pagamento.