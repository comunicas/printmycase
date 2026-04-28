
-- service_role bypasses RLS by design, so this policy is redundant
-- and only triggers the "RLS Policy Always True" warning.
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.stripe_webhook_events;
