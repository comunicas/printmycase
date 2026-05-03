-- Explicit SELECT policy documenting intent: only admins can read ai_generated_images
CREATE POLICY "Block public access to ai generated images"
  ON public.ai_generated_images
  FOR SELECT
  TO anon, authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Safe-columns view for potential frontend use (respects RLS via security_invoker)
CREATE OR REPLACE VIEW public.public_ai_generated_images
WITH (security_invoker = true)
AS
SELECT id, url, prompt, image_size, created_at
FROM public.ai_generated_images;

GRANT SELECT ON public.public_ai_generated_images TO anon, authenticated;