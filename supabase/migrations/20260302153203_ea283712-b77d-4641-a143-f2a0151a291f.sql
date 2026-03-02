
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
ALTER TABLE public.orders DROP COLUMN IF EXISTS stripe_subscription_id;
