
-- Enum for coin transaction types
CREATE TYPE public.coin_transaction_type AS ENUM (
  'signup_bonus',
  'referral_bonus',
  'purchase_bonus',
  'coin_purchase',
  'ai_usage',
  'admin_adjustment'
);

-- Coin transactions table
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type coin_transaction_type NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text
);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;

-- Function to generate random referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT upper(substr(md5(random()::text), 1, 6))
$$;

-- Function to get coin balance (non-expired positive + all negatives)
CREATE OR REPLACE FUNCTION public.get_coin_balance(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)::integer
  FROM public.coin_transactions
  WHERE user_id = _user_id
    AND (expires_at > now() OR amount < 0)
$$;

-- Trigger: auto-generate referral_code on profile insert
CREATE OR REPLACE FUNCTION public.handle_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_code();

-- Trigger: signup bonus (50 coins, 30 days)
CREATE OR REPLACE FUNCTION public.handle_signup_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.coin_transactions (user_id, amount, type, expires_at, description)
  VALUES (NEW.id, 50, 'signup_bonus', now() + interval '30 days', 'Bônus de cadastro');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_signup_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_signup_bonus();

-- Trigger: referral bonus (50 coins to referrer, 30 days)
CREATE OR REPLACE FUNCTION public.handle_referral_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.coin_transactions (user_id, amount, type, expires_at, description)
  VALUES (NEW.referrer_id, 50, 'referral_bonus', now() + interval '30 days', 'Bônus de indicação');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_referral_bonus
  AFTER INSERT ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_bonus();

-- RLS on coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin transactions"
  ON public.coin_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all coin transactions"
  ON public.coin_transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Authenticated users can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referred_id = auth.uid());

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
