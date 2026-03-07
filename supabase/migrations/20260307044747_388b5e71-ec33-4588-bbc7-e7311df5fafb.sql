
CREATE TABLE public.pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  customization_data jsonb NOT NULL,
  original_image_path text,
  edited_image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending" ON public.pending_checkouts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pending" ON public.pending_checkouts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pending" ON public.pending_checkouts
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own pending" ON public.pending_checkouts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pending_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
