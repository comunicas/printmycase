
-- Create kb_categories table
CREATE TABLE public.kb_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active kb categories" ON public.kb_categories
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins can manage kb categories" ON public.kb_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create kb_articles table
CREATE TABLE public.kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.kb_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active kb articles" ON public.kb_articles
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins can manage kb articles" ON public.kb_articles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on kb_articles
CREATE TRIGGER set_kb_articles_updated_at
  BEFORE UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add featured and kb_article_id to faqs
ALTER TABLE public.faqs ADD COLUMN featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.faqs ADD COLUMN kb_article_id uuid REFERENCES public.kb_articles(id) ON DELETE SET NULL;

-- Seed a default "Perguntas Frequentes" category
INSERT INTO public.kb_categories (name, slug, icon, description, sort_order)
VALUES ('Perguntas Frequentes', 'perguntas-frequentes', 'HelpCircle', 'Dúvidas mais comuns sobre nossos produtos e serviços', 0);
