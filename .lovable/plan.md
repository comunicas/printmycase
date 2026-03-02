
# Padronizacao de formularios + Painel Admin com CRUD de produtos e Stripe

## Status: ✅ Implementado

### Concluído

1. **Componentes de formulário padronizados** ✅
   - `src/components/ui/form-field.tsx` - Label + Input + erro/hint
   - `src/components/forms/FormCard.tsx` - Card wrapper com variante destructive
   - `src/components/forms/SubmitButton.tsx` - Botão submit com loading
   - Refatoradas: Login, Signup, ResetPassword, Profile

2. **Sistema de roles** ✅
   - Enum `app_role` (admin, user)
   - Tabela `user_roles` com RLS
   - Função `has_role()` SECURITY DEFINER
   - Hook `useAdmin` + componente `AdminGuard`

3. **Tabela products** ✅
   - Schema completo com slug, price_cents, stripe IDs, images, specs, colors
   - RLS: SELECT público (ativos), CRUD restrito a admins
   - Trigger `handle_updated_at`

4. **Página Admin** ✅
   - Rota `/admin` protegida por AuthGuard + AdminGuard
   - CRUD completo: listar, criar, editar, ativar/desativar
   - Dialog de formulário com geração automática de slug
   - Link condicional no UserMenu (só aparece para admins)

5. **Edge function `admin-sync-stripe`** ✅
   - Actions: create, update_price, archive
   - Validação de admin via service role
   - Sincroniza produto + preço com Stripe

## Próximos passos sugeridos
- Inserir produtos existentes de `src/data/products.ts` na tabela `products`
- Atualizar catálogo/produto para buscar do banco
- Atualizar `create-checkout` para usar `stripe_price_id` do banco
- Atribuir role admin ao primeiro usuário
