-- Defense-in-depth: ensure SELECT on user_ai_generations is always limited
-- to owner, admin, or rows explicitly marked public by admin.
CREATE POLICY "Restrict select to owner, admin or public"
ON public.user_ai_generations
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (
  public = true
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);