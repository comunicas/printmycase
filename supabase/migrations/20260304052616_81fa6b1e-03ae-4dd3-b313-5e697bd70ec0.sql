
-- Create public bucket for product assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', true);

-- Allow anyone to view files
CREATE POLICY "Anyone can view product assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-assets');

-- Allow admins to upload files
CREATE POLICY "Admins can upload product assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-assets'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update files
CREATE POLICY "Admins can update product assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-assets'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'product-assets'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete product assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-assets'
  AND public.has_role(auth.uid(), 'admin')
);
