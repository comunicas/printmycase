-- Revoke EXECUTE from anon on SECURITY DEFINER functions that don't need public access

REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_coin_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coin_balance(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.process_checkout_session_completed(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout_session_completed(text, integer, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.insert_model_request(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.insert_model_request(text, text, text) TO authenticated;