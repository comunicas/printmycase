DROP VIEW IF EXISTS public.public_ai_generations;

CREATE VIEW public.public_ai_generations
WITH (security_invoker = true)
AS
SELECT
  g.id,
  g.image_url,
  g.public_image_url,
  g.generation_type,
  g.created_at,
  f.name AS filter_name
FROM public.user_ai_generations g
LEFT JOIN public.ai_filters f ON f.id = g.filter_id
WHERE g.public = true;

GRANT SELECT ON public.public_ai_generations TO anon, authenticated;