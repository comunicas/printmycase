CREATE TABLE public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL,
  caption text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage instagram posts"
  ON public.instagram_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active instagram posts"
  ON public.instagram_posts FOR SELECT TO public
  USING (active = true);