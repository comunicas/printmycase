
-- Fix 1: Restrict public exposure of user_ai_generations to safe columns only.
-- The existing "Anyone can view public generations" policy exposes user_id,
-- source_image_url, storage_path — linking user identity to private photos.
-- Replace with a public view that only exposes display-safe columns.

DROP POLICY IF EXISTS "Anyone can view public generations" ON public.user_ai_generations;

-- Public view exposing only non-sensitive columns of approved public generations.
CREATE OR REPLACE VIEW public.public_ai_generations
WITH (security_invoker = true)
AS
SELECT
  id,
  image_url,
  public_image_url,
  filter_name,
  generation_type,
  created_at
FROM public.user_ai_generations
WHERE public = true;

GRANT SELECT ON public.public_ai_generations TO anon, authenticated;

-- Re-add a strict SELECT policy on the base table for the view to read through
-- (needed because security_invoker uses the caller's permissions).
CREATE POLICY "Public can read safe columns of public generations"
ON public.user_ai_generations
FOR SELECT
TO anon, authenticated
USING (public = true);

-- Note: column-level restriction is enforced by the view; direct SELECT * still
-- returns rows but clients should query the view. To fully prevent column leakage
-- via direct table access, we revoke column-level SELECT on sensitive columns
-- from anon/authenticated for non-owner rows is not possible via RLS alone.
-- Instead, REVOKE direct table SELECT from anon and rely on the view.
REVOKE SELECT ON public.user_ai_generations FROM anon;

-- Fix 2: Add SELECT policy for ai_generated_images (admin-only currently has ALL).
-- This is intentional — table is admin-only. Mark explicit denial of public access by ensuring no public policy exists.
-- (No change needed; admin ALL policy already covers admin SELECT. Documenting intent.)

-- Fix 3: Function search_path mutable — set search_path on functions missing it.
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
