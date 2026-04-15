

## Criar função `process_checkout_session_completed`

### Problema
O webhook do Stripe falha com `Could not find the function public.process_checkout_session_completed`, impedindo que pedidos avancem de `pending` para `analyzing` após pagamento confirmado.

### Solução
Migração SQL para criar a função que:
1. Atualiza o pedido de `pending` → `analyzing` pelo `stripe_session_id`
2. Insere bônus de coins para o usuário (se configurado)
3. Retorna dados do pedido para o webhook enviar e-mail de confirmação

### SQL

```sql
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
```

### Impacto
- Pedidos passarão automaticamente para `analyzing` após pagamento
- Bônus de coins será creditado
- O pedido pendente atual será reprocessado pelo retry automático do Stripe

