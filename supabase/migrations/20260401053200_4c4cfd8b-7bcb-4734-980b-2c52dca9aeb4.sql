-- 1. Remove direct INSERT policy on orders (orders are created server-side via create-checkout)
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;

-- 2. Add user_id to model_requests and fix INSERT policy
ALTER TABLE public.model_requests ADD COLUMN user_id uuid;

-- Drop the old overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can submit model request" ON public.model_requests;

-- Create scoped INSERT policy
CREATE POLICY "Users can insert own model requests"
ON public.model_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
