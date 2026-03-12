

## Migrar `getUser` → `getClaims` em 5 Edge Functions

Todas as funções abaixo usam `supabase.auth.getUser(token)` que é incompatível com tokens ES256 do Lovable Cloud, causando 401.

### Alterações

| Função | Mudança |
|---|---|
| `apply-ai-filter/index.ts` | `getUser(token)` → `getClaims(token)`, userId via `claims.sub` |
| `generate-gallery-image/index.ts` | Idem |
| `upscale-image/index.ts` | Idem |
| `create-coin-checkout/index.ts` | Idem; email via `claims.email` em vez de `userData.user.email` |
| `notify-order-status/index.ts` | Idem |
| `delete-account/index.ts` | Usa `adminClient.auth.getUser(token)` → `getClaims` com client anon, depois `admin.deleteUser(userId)` com o userId extraído das claims |

### Padrão aplicado

```typescript
// ANTES
const { data: userData, error: userError } = await supabase.auth.getUser(token);
if (userError || !userData?.user) { /* 401 */ }
const userId = userData.user.id;

// DEPOIS
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
if (claimsError || !claimsData?.claims) { /* 401 */ }
const userId = claimsData.claims.sub as string;
```

Para `create-coin-checkout`, o email do usuário (`user.email`) passa a ser `claimsData.claims.email as string`.

Para `delete-account`, será criado um client anon para validar o token via `getClaims`, mantendo o `adminClient` apenas para a operação de deletar.

