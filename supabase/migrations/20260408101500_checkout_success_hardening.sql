-- Add nonce used to validate short-lived public success tokens
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS public_success_nonce text;

-- Defensive RLS refresh to guarantee no client-side broad reads on orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
