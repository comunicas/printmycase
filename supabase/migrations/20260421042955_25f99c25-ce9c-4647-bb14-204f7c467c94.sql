CREATE POLICY "Admins can view all customization objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customizations'
  AND public.has_role(auth.uid(), 'admin')
);