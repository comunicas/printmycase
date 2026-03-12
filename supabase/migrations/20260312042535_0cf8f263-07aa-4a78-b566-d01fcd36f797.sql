ALTER TABLE public.ai_generated_images
  ADD COLUMN image_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN safety_tolerance integer NOT NULL DEFAULT 2,
  ADD COLUMN output_format text NOT NULL DEFAULT 'png';