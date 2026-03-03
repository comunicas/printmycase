
ALTER TABLE public.orders
  ADD COLUMN shipping_cents integer,
  ADD COLUMN tracking_code text,
  ADD COLUMN shipping_address jsonb;

-- Allow admins to update orders (for tracking_code, status, etc.)
CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
