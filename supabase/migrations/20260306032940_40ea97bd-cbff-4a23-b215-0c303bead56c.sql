CREATE TABLE public.ai_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active filters"
  ON public.ai_filters FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage filters"
  ON public.ai_filters FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));