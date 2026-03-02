-- Allow service role to update orders (for webhook status updates)
CREATE POLICY "Service role can update orders"
ON public.orders FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);