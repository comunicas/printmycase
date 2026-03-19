-- 1. Recreate trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill profiles for existing users without one
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3. Backfill signup bonus for users who never received it
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