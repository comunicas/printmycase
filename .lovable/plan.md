

## Atualizar referências de domínio antigo no código

Encontrei referências ao domínio antigo `artiscase-v2.lovable.app` que precisam apontar para `studio.artiscase.com`. As referências a `studio.artiscase.com` já estão corretas.

### Arquivos que precisam de alteração

| Arquivo | Linha | Atual | Novo |
|---------|-------|-------|------|
| `src/components/SeoHead.tsx` | 6 | fallback `artiscase-v2.lovable.app` | `studio.artiscase.com` |
| `supabase/functions/notify-order-status/index.ts` | 200 | fallback `artiscase-v2.lovable.app` | `studio.artiscase.com` |
| `supabase/functions/auth-email-hook/index.ts` | 38, 48 | `SITE_NAME = "artiscase-v2"`, `SAMPLE_PROJECT_URL = artiscase-v2.lovable.app` | `"ArtisCase"`, `https://studio.artiscase.com` |

### Arquivos já corretos (sem alteração necessária)
- `create-checkout/index.ts` — já usa `studio.artiscase.com`
- `notify-order-status/index.ts` — `SENDER_DOMAIN` e `FROM` já usam `studio.artiscase.com`
- `auth-email-hook/index.ts` — `SENDER_DOMAIN`, `ROOT_DOMAIN`, `FROM_DOMAIN` já corretos

### Resumo
3 arquivos, 4 linhas a alterar — apenas substituição de fallbacks com o domínio antigo do Lovable.

