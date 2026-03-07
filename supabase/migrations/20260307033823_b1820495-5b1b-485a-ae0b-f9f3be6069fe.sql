
-- 1. Create coin_settings table
CREATE TABLE public.coin_settings (
  key text PRIMARY KEY,
  value integer NOT NULL,
  description text
);

-- 2. Enable RLS
ALTER TABLE public.coin_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS: authenticated users can read
CREATE POLICY "Authenticated users can read coin settings"
  ON public.coin_settings FOR SELECT
  TO authenticated
  USING (true);

-- 4. RLS: admins can manage
CREATE POLICY "Admins can manage coin settings"
  ON public.coin_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Seed initial values
INSERT INTO public.coin_settings (key, value, description) VALUES
  ('signup_bonus_amount', 50, 'Quantidade de moedas no bônus de cadastro'),
  ('signup_bonus_days', 30, 'Dias de validade do bônus de cadastro'),
  ('referral_bonus_amount', 50, 'Quantidade de moedas no bônus de indicação'),
  ('referral_bonus_days', 30, 'Dias de validade do bônus de indicação'),
  ('purchase_bonus_amount', 100, 'Quantidade de moedas no bônus de compra'),
  ('purchase_bonus_days', 30, 'Dias de validade do bônus de compra'),
  ('ai_filter_cost', 10, 'Custo em moedas por filtro IA');

-- 6. Update handle_signup_bonus to read from coin_settings
CREATE OR REPLACE FUNCTION public.handle_signup_bonus()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  _amount integer;
  _days integer;
BEGIN
  SELECT value INTO _amount FROM public.coin_settings WHERE key = 'signup_bonus_amount';
  SELECT value INTO _days FROM public.coin_settings WHERE key = 'signup_bonus_days';
  _amount := COALESCE(_amount, 50);
  _days := COALESCE(_days, 30);

  INSERT INTO public.coin_transactions (user_id, amount, type, expires_at, description)
  VALUES (NEW.id, _amount, 'signup_bonus', now() + (_days || ' days')::interval, 'Bônus de cadastro');
  RETURN NEW;
END;
$function$;

-- 7. Update handle_referral_bonus to read from coin_settings
CREATE OR REPLACE FUNCTION public.handle_referral_bonus()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  _amount integer;
  _days integer;
BEGIN
  SELECT value INTO _amount FROM public.coin_settings WHERE key = 'referral_bonus_amount';
  SELECT value INTO _days FROM public.coin_settings WHERE key = 'referral_bonus_days';
  _amount := COALESCE(_amount, 50);
  _days := COALESCE(_days, 30);

  INSERT INTO public.coin_transactions (user_id, amount, type, expires_at, description)
  VALUES (NEW.referrer_id, _amount, 'referral_bonus', now() + (_days || ' days')::interval, 'Bônus de indicação');
  RETURN NEW;
END;
$function$;
