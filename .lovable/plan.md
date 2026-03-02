

# Corrigir Edge Functions: Substituir Stripe SDK por chamadas REST diretas

## Problema
O erro `Deno.core.runMicrotasks() is not supported` persiste com todas as abordagens de import do Stripe SDK (esm.sh, npm:). A versao 17.7.0 carrega polyfills Node incompativeis com o Supabase Edge Runtime.

## Solucao
Substituir o Stripe SDK por chamadas diretas a API REST do Stripe usando `fetch`. Isso elimina completamente a dependencia do SDK e os polyfills problematicos.

## Alteracoes

### 1. `supabase/functions/create-checkout/index.ts`
- Remover import do Stripe SDK
- Criar sessao de checkout via `fetch` para `https://api.stripe.com/v1/checkout/sessions`
- Usar `STRIPE_SECRET_KEY` no header `Authorization: Bearer`
- Enviar parametros como `application/x-www-form-urlencoded` (formato exigido pela API Stripe)
- Manter toda a logica de autenticacao, upload e insercao de pedido inalterada

### 2. `supabase/functions/stripe-webhook/index.ts`
- Remover import do Stripe SDK
- Implementar verificacao de assinatura HMAC-SHA256 manualmente usando `crypto.subtle`
- Comparar assinatura calculada com a do header `stripe-signature`
- Parsear o evento diretamente do body JSON
- Manter logica de atualizacao de status dos pedidos

## Detalhes Tecnicos

### Checkout Session via REST
```text
POST https://api.stripe.com/v1/checkout/sessions
Authorization: Bearer sk_...
Content-Type: application/x-www-form-urlencoded

payment_method_types[0]=card
mode=payment
line_items[0][price_data][currency]=brl
line_items[0][price_data][unit_amount]=6990
...
```

### Verificacao de Webhook sem SDK
A assinatura Stripe usa HMAC-SHA256:
1. Extrair timestamp e assinatura do header `stripe-signature`
2. Construir payload assinado: `{timestamp}.{body}`
3. Calcular HMAC-SHA256 com o webhook secret
4. Comparar com a assinatura recebida
5. Verificar tolerancia de tempo (5 minutos)

### Vantagens
- Zero dependencia de pacotes externos para Stripe
- Compatibilidade total com o Edge Runtime
- Sem polyfills Node problematicos
- Mais leve e rapido para inicializar

