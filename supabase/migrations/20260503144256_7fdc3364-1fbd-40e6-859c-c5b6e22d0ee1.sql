CREATE POLICY "Anyone can view public generations"
ON public.user_ai_generations
FOR SELECT
TO anon, authenticated
USING (public = true);