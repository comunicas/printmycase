

## Atualizar domínio de produção

Trocar o fallback de origin no `create-checkout/index.ts` de `https://artiscase.com.br` para `https://studio.artiscase.com`.

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/create-checkout/index.ts` | Fallback origin → `https://studio.artiscase.com` |

