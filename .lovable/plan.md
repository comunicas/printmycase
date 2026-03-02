
# Adicionar STRIPE_WEBHOOK_SECRET

## O que será feito

Usar a ferramenta `add_secret` para solicitar o valor do `STRIPE_WEBHOOK_SECRET` (o signing secret `whsec_...` do webhook configurado no Stripe Dashboard).

## Pré-requisito (do seu lado)

1. Acesse o **Stripe Dashboard** em Developers → Webhooks
2. Localize o webhook que aponta para: `https://gfsbsgwxylvhnwbpcodj.supabase.co/functions/v1/stripe-webhook`
3. Copie o **Signing secret** (formato: `whsec_...`)

## Implementação

1. Chamar a ferramenta `add_secret` com o nome `STRIPE_WEBHOOK_SECRET` para que você possa colar o valor
2. Após adicionado, a edge function `stripe-webhook` passará a validar as assinaturas dos eventos do Stripe automaticamente

Nenhuma alteração de código é necessária — a edge function já lê `Deno.env.get("STRIPE_WEBHOOK_SECRET")` e usa para verificar a assinatura.
