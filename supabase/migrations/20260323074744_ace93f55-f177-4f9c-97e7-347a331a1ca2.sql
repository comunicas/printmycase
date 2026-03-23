ALTER TABLE public.user_ai_generations ADD COLUMN IF NOT EXISTS public boolean NOT NULL DEFAULT false;

CREATE POLICY "Anyone can view public generations"
  ON public.user_ai_generations FOR SELECT TO public
  USING (public = true);