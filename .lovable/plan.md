
# Corrigir erro de runtime nas Edge Functions

## Problema
Os logs mostram que o erro `Deno.core.runMicrotasks() is not supported` persiste em ambas as edge functions, e o `stripe-webhook` ainda executa `constructEvent` sincrono (versao antiga em cache). O import via `esm.sh` do Stripe SDK puxa polyfills Node incompativeis com o edge runtime, mesmo com `&no-dts`.

## Solucao
Trocar o import `esm.sh` pelo especificador **`npm:`** nativo do Deno, que carrega o pacote diretamente sem polyfills problematicos.

## Alteracoes

### 1. `supabase/functions/create-checkout/index.ts`
Linha 1 — trocar:
```text
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&no-check&no-dts";
```
por:
```text
import Stripe from "npm:stripe@17.7.0";
```

### 2. `supabase/functions/stripe-webhook/index.ts`
Linha 1 — mesma troca:
```text
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&no-check&no-dts";
```
por:
```text
import Stripe from "npm:stripe@17.7.0";
```

### 3. Reimplantar ambas as edge functions
Apos a alteracao, fazer o deploy para garantir que o novo codigo entre em vigor.

## Por que isso funciona
O especificador `npm:` e suportado nativamente pelo Deno e pelo Supabase Edge Runtime. Ele carrega o pacote NPM diretamente sem os polyfills `deno.land/std/node` que causam o erro `runMicrotasks`. E a abordagem recomendada pela propria documentacao do Supabase para edge functions.
