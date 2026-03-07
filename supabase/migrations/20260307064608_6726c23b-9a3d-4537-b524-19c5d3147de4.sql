
-- Fix #1: model_requests - restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can submit model request" ON public.model_requests;
CREATE POLICY "Authenticated users can submit model request"
  ON public.model_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix #2: coin_transactions - ensure policies target authenticated role
DROP POLICY IF EXISTS "Users can view own coin transactions" ON public.coin_transactions;
CREATE POLICY "Users can view own coin transactions"
  ON public.coin_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Fix #3: referrals - ensure policies target authenticated role
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can insert referrals" ON public.referrals;
CREATE POLICY "Authenticated users can insert referrals"
  ON public.referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referred_id = auth.uid());
