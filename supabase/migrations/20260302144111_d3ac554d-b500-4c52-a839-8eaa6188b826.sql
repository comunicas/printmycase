-- Storage bucket para imagens customizadas
INSERT INTO storage.buckets (id, name, public)
VALUES ('customizations', 'customizations', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: usuario pode fazer upload na sua pasta
CREATE POLICY "Users can upload own customizations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: usuario pode ver suas proprias imagens
CREATE POLICY "Users can view own customizations"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: service role pode ler qualquer imagem
CREATE POLICY "Service role can read all customizations"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'customizations');