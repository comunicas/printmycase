-- Fix 1: Add SELECT policy for users to view their own model requests
CREATE POLICY "Users can view own model requests"
ON public.model_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fix 2: Add UPDATE and DELETE policies for customizations storage bucket
CREATE POLICY "Users can update own customization files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own customization files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);