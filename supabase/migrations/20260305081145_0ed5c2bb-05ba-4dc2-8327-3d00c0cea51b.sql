CREATE TABLE public.model_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  model_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.model_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit model request"
  ON public.model_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view model requests"
  ON public.model_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete model requests"
  ON public.model_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));