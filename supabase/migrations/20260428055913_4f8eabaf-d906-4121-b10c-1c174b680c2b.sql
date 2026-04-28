
-- Tighten contact_messages insert: require non-empty fields. Keeps the
-- public form working but removes the "WITH CHECK (true)" warning.
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can insert valid contact messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    length(btrim(name)) > 0
    AND length(btrim(email)) > 0
    AND length(btrim(message)) > 0
    AND email LIKE '%@%.%'
  );

-- Document intent on stripe_webhook_events: only service_role (which
-- bypasses RLS) should access this table. Add an explicit deny policy
-- for anon/authenticated so the linter sees an explicit policy.
CREATE POLICY "Block direct access to webhook events"
  ON public.stripe_webhook_events
  FOR SELECT
  TO anon, authenticated
  USING (false);
