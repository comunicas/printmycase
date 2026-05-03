-- 1) model_requests: enforce owner not null
UPDATE public.model_requests SET user_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE user_id IS NULL;
ALTER TABLE public.model_requests ALTER COLUMN user_id SET NOT NULL;

-- 2) user_ai_generations: drop the permissive public column-leaking SELECT policy.
-- Public read access continues via the public_ai_generations view (security_invoker).
DROP POLICY IF EXISTS "Public can read safe columns of public generations" ON public.user_ai_generations;

-- 3) products: hide stripe_*_id from public reads via a dedicated view
CREATE OR REPLACE VIEW public.public_products
WITH (security_invoker = true) AS
SELECT
  id, slug, name, description, price_cents, images, colors, specs,
  rating, review_count, active, device_image, created_at, updated_at
FROM public.products
WHERE active = true;

GRANT SELECT ON public.public_products TO anon, authenticated;