
CREATE TABLE public.user_ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  generation_type text NOT NULL DEFAULT 'filter',
  filter_id uuid REFERENCES public.ai_filters(id) ON DELETE SET NULL,
  filter_name text,
  source_image_url text,
  step_number integer NOT NULL DEFAULT 1,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON public.user_ai_generations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own generations"
  ON public.user_ai_generations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own generations"
  ON public.user_ai_generations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all generations"
  ON public.user_ai_generations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_user_ai_generations_user_id ON public.user_ai_generations(user_id);
CREATE INDEX idx_user_ai_generations_session_id ON public.user_ai_generations(session_id);
