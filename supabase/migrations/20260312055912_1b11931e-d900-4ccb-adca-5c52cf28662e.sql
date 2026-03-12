
-- Collections table
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active collections" ON public.collections
  FOR SELECT TO public
  USING (active = true);

CREATE TRIGGER handle_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Collection designs table
CREATE TABLE public.collection_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text NOT NULL,
  price_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collection designs" ON public.collection_designs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active collection designs" ON public.collection_designs
  FOR SELECT TO public
  USING (active = true);

-- Add design_id to orders
ALTER TABLE public.orders ADD COLUMN design_id uuid REFERENCES public.collection_designs(id);
