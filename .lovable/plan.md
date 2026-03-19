

## Diagnóstico: Trigger `handle_new_user` ausente no `auth.users`

### Problema encontrado
O trigger que cria o perfil do usuário na tabela `profiles` ao registrar-se (`handle_new_user`) **não existe** na tabela `auth.users`. Consequências:
- Nenhum perfil é criado (0 registros em `profiles`)
- O trigger `trg_signup_bonus` (que dispara AFTER INSERT em `profiles`) nunca é acionado
- O trigger `trg_referral_bonus` nunca é acionado (pois referrals também dependem do perfil)
- 0 transações de moedas no sistema

A função `handle_new_user()` existe e está correta, mas o trigger que a conecta ao `auth.users` foi perdido (provavelmente durante uma migration anterior).

### Correção

#### 1. Recriar o trigger no `auth.users` (migration SQL)

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### 2. Criar perfis para usuários existentes que ficaram sem perfil

```sql
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

#### 3. Creditar bônus de cadastro retroativo para os usuários afetados

```sql
INSERT INTO public.coin_transactions (user_id, amount, type, expires_at, description)
SELECT
  p.id,
  COALESCE((SELECT value FROM public.coin_settings WHERE key = 'signup_bonus_amount'), 50),
  'signup_bonus',
  now() + (COALESCE((SELECT value FROM public.coin_settings WHERE key = 'signup_bonus_days'), 30) || ' days')::interval,
  'Bônus de cadastro (retroativo)'
FROM public.profiles p
LEFT JOIN public.coin_transactions ct ON ct.user_id = p.id AND ct.type = 'signup_bonus'
WHERE ct.id IS NULL;
```

### Nenhuma alteração de código necessária
Toda a lógica de código (triggers, functions, hooks, UI) está correta. Apenas o trigger no `auth.users` precisa ser restaurado.

### Resumo

| Alteração | Detalhe |
|-----------|---------|
| Migration SQL | Recriar trigger `on_auth_user_created` em `auth.users` |
| Migration SQL | Backfill de perfis para usuários existentes sem perfil |
| Migration SQL | Backfill de bônus de cadastro retroativo |

