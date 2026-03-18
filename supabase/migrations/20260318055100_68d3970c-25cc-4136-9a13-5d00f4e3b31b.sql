CREATE TABLE public.coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coins integer NOT NULL,
  price_cents integer NOT NULL,
  badge text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coin packages"
  ON public.coin_packages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active coin packages"
  ON public.coin_packages FOR SELECT TO public
  USING (active = true);

INSERT INTO public.coin_packages (coins, price_cents, badge, sort_order) VALUES
  (100, 990, NULL, 0),
  (500, 3990, 'Mais popular', 1),
  (1500, 9990, NULL, 2),
  (5000, 24990, 'Melhor valor', 3);