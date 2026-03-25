

## Atualizar Edge Functions restantes para getClaims

### Situação atual
- `create-checkout` — **já usa `getClaims`**, nada a fazer
- `create-coin-checkout` — usa `getUser`, precisa migrar. Usa `user.email` para Stripe customer lookup → extrair email de `claimsData.claims.email`
- `delete-account` — usa `adminClient.auth.getUser`, precisa migrar. Usa apenas `user.id` → extrair de `claimsData.claims.sub`

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `create-coin-checkout/index.ts` (linhas 48-63) | Trocar `getUser(token)` por `getClaims(token)`. Extrair `userId` de `claims.sub` e `userEmail` de `claims.email`. Usar `userEmail` no Stripe customer lookup (linha 89) e `customer_email` (linha 96) |
| 2 | `delete-account/index.ts` (linhas 29-38) | Trocar `adminClient.auth.getUser(token)` por `adminClient.auth.getClaims(token)`. Extrair `userId` de `claims.sub`. O resto (avatar cleanup + deleteUser) permanece igual |

### Notas
- `notify-order-status` usa `getUser` mas é para **lookup de admin caller** — já valida via `has_role` RPC e funciona corretamente, não precisa migrar
- `delete-account` usa `adminClient` (service role) para `getUser`, mas `getClaims` funciona igualmente pois apenas valida o JWT

