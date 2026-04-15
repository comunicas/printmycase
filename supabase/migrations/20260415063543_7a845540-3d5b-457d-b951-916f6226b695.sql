CREATE OR REPLACE FUNCTION public.process_checkout_session_completed(
  _stripe_session_id text,
  _bonus_amount integer,
  _bonus_days integer
)
RETURNS TABLE(order_id uuid, user_id uuid, product_id text, total_cents integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order record;
BEGIN
  UPDATE orders
  SET status = 'analyzing'
  WHERE stripe_session_id = _stripe_session_id
    AND status = 'pending'
  RETURNING id, orders.user_id, orders.product_id, orders.total_cents
  INTO _order;

  IF _order IS NULL THEN RETURN; END IF;

  IF _bonus_amount > 0 THEN
    INSERT INTO coin_transactions (user_id, amount, type, expires_at, description)
    VALUES (
      _order.user_id,
      _bonus_amount,
      'purchase_bonus',
      now() + (_bonus_days || ' days')::interval,
      'Bônus por compra'
    );
  END IF;

  RETURN QUERY SELECT _order.id, _order.user_id, _order.product_id, _order.total_cents;
END;
$$;