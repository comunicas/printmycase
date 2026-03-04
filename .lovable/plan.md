

# Fase 4: Reescrita do ARCHITECTURE.md

Reescrever completamente o `ARCHITECTURE.md` para refletir o estado atual da plataforma após as Fases 1-3. O documento está totalmente desatualizado — ainda diz "Case Studio", "sem backend", lista `data/products.ts` como dados mock, e não menciona Supabase, Stripe, autenticação, admin, pedidos, ou edge functions.

## Mudanças principais

1. **Nome e descrição**: "ArtisCase" (não "Case Studio"), plataforma com backend completo (não "sem backend")
2. **Stack**: Adicionar Supabase (DB + Auth + Storage + Edge Functions) e Stripe (pagamentos)
3. **Rotas**: Atualizar de 5 para 13 rotas, incluindo auth, checkout, admin, orders, profile
4. **Estrutura de pastas**: Refletir a estrutura real — `contexts/`, `lib/` (types, constants, masks, shipping, products), `components/admin/`, `components/checkout/`, `components/forms/`, `supabase/functions/`
5. **Modelo de dados**: Interface `Product` atualizada com `slug`, `price_cents`, `stripe_price_id`, `active`, etc. Mencionar tabelas DB: `products`, `orders`, `addresses`, `profiles`, `user_roles`
6. **Arquitetura**: AuthContext centralizado, lazy loading de rotas, LoadingSpinner compartilhado
7. **Edge Functions**: Documentar as 7 functions (create-checkout, stripe-webhook, delete-account, notify-order-status, admin-sync-stripe, bulk-sync-stripe, auth-email-hook)
8. **SEO**: Atualizado — sem SearchAction, sem hardcode "iPhone"
9. **Segurança**: RLS, RBAC via `user_roles` + `has_role()`, JWT validation em edge functions

## Arquivo afetado

| Ação | Arquivo |
|------|---------|
| Reescrever | `ARCHITECTURE.md` |

