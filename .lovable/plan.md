

# Melhorias na confirmação e histórico de pedidos

## 1. Migração: novos status de pedido

O enum `order_status` atual tem: `pending`, `paid`, `shipped`, `delivered`, `cancelled`. Precisa incluir os novos status do fluxo de produto customizado:

- `analyzing` (Em Análise) — pagamento confirmado, equipe revisando
- `customizing` (Customizando) — arte sendo preparada
- `producing` (Produzindo) — capa em produção

SQL: `ALTER TYPE order_status ADD VALUE 'analyzing' AFTER 'paid'; ALTER TYPE order_status ADD VALUE 'customizing' AFTER 'analyzing'; ALTER TYPE order_status ADD VALUE 'producing' AFTER 'customizing';`

Atualizar também o webhook para setar `analyzing` em vez de `paid` quando o pagamento é confirmado.

## 2. CheckoutSuccess — mostrar info do produto

Atualmente a página de sucesso não mostra qual produto foi comprado. Buscar o pedido mais recente do usuário via `stripe_session_id` (já vem no query param `session_id`) para exibir:
- Nome do produto (ex: "Capa Personalizada - Motorola Edge 50 Pro")
- Valor total
- Prazo estimado: "5 a 7 dias úteis"

Fazer um `useEffect` que consulta `orders` por `stripe_session_id` e depois `products` pelo `product_id`.

## 3. Orders — redesign dos cards

Problemas atuais (visíveis no screenshot): mostra UUIDs em vez de nomes de produto, layout confuso.

Mudanças:
- Prefixar com "Capa Personalizada - " + nome do produto
- Adicionar timeline visual dos status com ícones/steps ao invés de badge isolado
- Status mapeados para o fluxo customizado:
  - `pending` → "Aguardando Pagamento"
  - `analyzing` → "Em Análise"
  - `customizing` → "Customizando"
  - `producing` → "Produzindo"
  - `shipped` → "Enviado"
  - `delivered` → "Entregue"
  - `cancelled` → "Cancelado"
- Mostrar prazo estimado: "Prazo: 5 a 7 dias úteis"
- Simplificar exibição de preço (total apenas, sem breakdown de frete visível por padrão)

## 4. Webhook update

No `stripe-webhook/index.ts`, mudar `checkout.session.completed` para setar status `analyzing` em vez de `paid`.

## Arquivos afetados

- **Migração SQL**: adicionar 3 valores ao enum `order_status`
- **`supabase/functions/stripe-webhook/index.ts`**: status `paid` → `analyzing`
- **`src/pages/CheckoutSuccess.tsx`**: buscar dados do pedido/produto, exibir nome e prazo
- **`src/pages/Orders.tsx`**: novo mapa de status, timeline visual, nome legível, prazo estimado

