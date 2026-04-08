-- Idempotency registry for Stripe webhooks
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  stripe_session_id text,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_type_session
  ON public.stripe_webhook_events(event_type, stripe_session_id)
  WHERE stripe_session_id IS NOT NULL
    AND event_type IN ('checkout.session.completed', 'checkout.session.expired');

-- Idempotency for purchase bonus by Stripe session
CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_tx_purchase_bonus_session_unique
  ON public.coin_transactions(type, stripe_session_id)
  WHERE type = 'purchase_bonus' AND stripe_session_id IS NOT NULL;

-- Stable idempotency for order transactional emails by (order_id + template)
WITH ranked_logs AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY template_name, metadata->>'order_id'
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.email_send_log
  WHERE metadata ? 'order_id'
)
DELETE FROM public.email_send_log logs
USING ranked_logs ranked
WHERE logs.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_order_template_unique
  ON public.email_send_log(template_name, (metadata->>'order_id'))
  WHERE metadata ? 'order_id';

-- Atomic processing path for checkout.session.completed
CREATE OR REPLACE FUNCTION public.process_checkout_session_completed(
  _stripe_session_id text,
  _bonus_amount integer,
  _bonus_days integer
)
RETURNS TABLE (
  order_id uuid,
  user_id uuid,
  total_cents integer,
  product_id text,
  bonus_inserted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  UPDATE public.orders
  SET status = 'analyzing'
  WHERE stripe_session_id = _stripe_session_id
  RETURNING * INTO v_order;

  IF NOT FOUND THEN
    SELECT * INTO v_order
    FROM public.orders
    WHERE stripe_session_id = _stripe_session_id
    LIMIT 1;
  END IF;

  IF v_order.id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.coin_transactions (
    user_id,
    amount,
    type,
    expires_at,
    description,
    stripe_session_id
  )
  VALUES (
    v_order.user_id,
    _bonus_amount,
    'purchase_bonus',
    now() + make_interval(days => _bonus_days),
    'Bônus por compra de case',
    _stripe_session_id
  )
  ON CONFLICT (type, stripe_session_id)
    WHERE type = 'purchase_bonus'
  DO NOTHING;

  RETURN QUERY
  SELECT
    v_order.id,
    v_order.user_id,
    v_order.total_cents,
    v_order.product_id,
    EXISTS (
      SELECT 1
      FROM public.coin_transactions ct
      WHERE ct.type = 'purchase_bonus'
        AND ct.stripe_session_id = _stripe_session_id
    ) AS bonus_inserted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_checkout_session_completed(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_checkout_session_completed(text, integer, integer) TO service_role;
