

## Atualizar Edge Functions para usar getClaims

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `supabase/functions/upscale-image/index.ts` (linhas 30-37) | Trocar `getUser(token)` por `getClaims(token)`. Extrair `userId` de `claimsData.claims.sub` |
| 2 | `supabase/functions/generate-gallery-image/index.ts` (linhas 30-36) | Trocar `getUser(token)` por `getClaims(token)`. Extrair userId de `claimsData.claims.sub` e usar no `has_role` RPC (linha 44) |

### Padrão aplicado (mesmo do apply-ai-filter)

```typescript
// Antes
const { data: userData, error: userError } = await supabase.auth.getUser(token);
if (userError || !userData?.user) { /* 401 */ }
const userId = userData.user.id;

// Depois
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
if (claimsError || !claimsData?.claims) { /* 401 */ }
const userId = claimsData.claims.sub as string;
```

Sem mudança funcional — apenas valida o JWT localmente em vez de fazer round-trip ao servidor.

