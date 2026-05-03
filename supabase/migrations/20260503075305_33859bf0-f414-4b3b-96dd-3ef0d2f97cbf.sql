-- Remove public read access to products table; public access continues via public_products view (which excludes Stripe IDs)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Cast data type fix for resolveProductInfo cast against the view
-- (no DDL needed; view already grants SELECT to anon/authenticated)