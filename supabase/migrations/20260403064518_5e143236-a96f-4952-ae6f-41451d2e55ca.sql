CREATE POLICY "Users can update own generations"
ON public.user_ai_generations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());