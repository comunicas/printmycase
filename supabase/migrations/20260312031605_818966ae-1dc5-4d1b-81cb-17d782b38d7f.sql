
CREATE TABLE public.ai_generated_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  prompt text NOT NULL,
  seed integer,
  image_size text NOT NULL DEFAULT 'auto',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ai generated images"
  ON public.ai_generated_images
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view ai generated images"
  ON public.ai_generated_images
  FOR SELECT
  TO public
  USING (true);
