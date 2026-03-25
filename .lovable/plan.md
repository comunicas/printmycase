

## Migrar Edge Functions restantes para getClaims

### Status atual

| Função | Auth do caller | Status |
|--------|---------------|--------|
| apply-ai-filter | `getClaims` | OK |
| create-checkout | `getClaims` | OK |
| create-coin-checkout | `getClaims` | OK |
| delete-account | `getClaims` | OK |
| upscale-image | `getClaims` | OK |
| generate-gallery-image | `getClaims` | OK |
| admin-sync-stripe | `getClaims` | OK |
| bulk-sync-stripe | `getClaims` | OK |
| meta-capi | `getClaims` | OK |
| **verify-coin-purchase** | `getUser` | **Migrar** |
| **upload-gallery-zip** | `getUser` | **Migrar** |
| **notify-order-status** | `getUser` (caller) | **Migrar** |
| stripe-webhook | `getUserById` (admin lookup) | OK — busca dados de outro user, não valida caller |

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `verify-coin-purchase/index.ts` | Trocar `getUser(token)` por `getClaims(token)`. Extrair `userId` de `claims.sub` e `userEmail` de `claims.email` (usado na comparação com metadata do Stripe) |
| 2 | `upload-gallery-zip/index.ts` | Trocar `getUser()` por `getClaims(token)`. Extrair `userId` de `claims.sub` para a verificação de role admin |
| 3 | `notify-order-status/index.ts` | Trocar `getUser(token)` por `getClaims(token)` na autenticação do caller admin. O `getUserById` nas linhas 80-81 permanece (é lookup de dados de outro usuário, não validação de JWT) |

### Notas
- `stripe-webhook` usa `auth.admin.getUserById()` para buscar email/perfil de usuários em webhooks server-to-server — isso é correto e não precisa mudar
- `notify-order-status` linha 81 (`getUserById`) também é lookup de dados, não autenticação — mantém

