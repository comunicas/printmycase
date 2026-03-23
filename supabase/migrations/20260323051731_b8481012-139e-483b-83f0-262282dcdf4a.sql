
CREATE TABLE public.ai_filter_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_filter_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage filter categories" ON public.ai_filter_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active filter categories" ON public.ai_filter_categories
  FOR SELECT TO public USING (active = true);

INSERT INTO public.ai_filter_categories (name, sort_order) VALUES
  ('Estilo', 1),
  ('Qualidade', 2);

ALTER TABLE public.ai_filters ADD COLUMN category_id uuid REFERENCES public.ai_filter_categories(id) ON DELETE SET NULL;
