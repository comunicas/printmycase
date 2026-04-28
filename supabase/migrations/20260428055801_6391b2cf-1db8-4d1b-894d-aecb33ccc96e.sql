
-- 1) Replace ALL+true policy on email_send_state with explicit per-cmd policies
DROP POLICY IF EXISTS "Service role can manage send state" ON public.email_send_state;

CREATE POLICY "Service role can read send state"
  ON public.email_send_state FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert send state"
  ON public.email_send_state FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update send state"
  ON public.email_send_state FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete send state"
  ON public.email_send_state FOR DELETE
  TO public
  USING (auth.role() = 'service_role');

-- 2) Remove broad SELECT (LIST) policies on public storage buckets.
-- Public buckets continue to serve files via the public CDN URL — only
-- the ability to LIST objects through the API is removed.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product assets" ON storage.objects;

-- 3) Lock down SECURITY DEFINER function execute privileges

-- Trigger-only functions: nobody calls them via API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_signup_bonus() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_referral_bonus() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_referral_code() FROM PUBLIC, anon, authenticated;

-- Backend-only helpers (edge functions use service_role)
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;

REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;

REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.process_checkout_session_completed(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout_session_completed(text, integer, integer) TO service_role;

-- get_coin_balance: only signed-in users (used by frontend useCoins.ts)
REVOKE ALL ON FUNCTION public.get_coin_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coin_balance(uuid) TO authenticated, service_role;

-- has_role: stays callable by anon + authenticated (used inside RLS policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;
