

# Corrigir import do Supabase nas Edge Functions

## Problema Identificado

O erro `Deno.core.runMicrotasks() is not supported` **nao vem do Stripe** (que ja foi substituido por chamadas REST diretas). O erro vem do **import do Supabase client via `esm.sh`**:

```
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
```

O `esm.sh` empacota polyfills Node.js incompativeis com o Edge Runtime do Supabase, causando o crash na funcao antes mesmo de processar a requisicao.

## Solucao

Trocar o import `esm.sh` pelo especificador **`jsr:`** (JSR Registry), que e o metodo oficialmente recomendado pelo Supabase para Edge Functions:

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";
```

## Alteracoes

### 1. `supabase/functions/create-checkout/index.ts`
- Linha 1: trocar `"https://esm.sh/@supabase/supabase-js@2.98.0"` por `"jsr:@supabase/supabase-js@2"`
- Tambem substituir `supabase.auth.getClaims(token)` por `supabase.auth.getUser(token)` — o metodo `getClaims` nao existe no SDK v2; o correto e `getUser` que retorna os dados do usuario autenticado

### 2. `supabase/functions/stripe-webhook/index.ts`
- Linha 1: mesma troca de import para `"jsr:@supabase/supabase-js@2"`

### 3. Reimplantar ambas as edge functions

## Por que isso resolve

O especificador `jsr:` carrega o pacote diretamente do JSR Registry, que fornece modulos nativos para Deno sem polyfills Node.js. E o metodo recomendado pela documentacao oficial do Supabase para Edge Functions.

## Detalhes Tecnicos

| Arquivo | Problema | Correcao |
|---|---|---|
| `create-checkout/index.ts` | `esm.sh` import + `getClaims` inexistente | `jsr:` import + `getUser` |
| `stripe-webhook/index.ts` | `esm.sh` import | `jsr:` import |

