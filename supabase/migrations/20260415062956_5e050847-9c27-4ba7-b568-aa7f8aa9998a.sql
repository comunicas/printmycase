-- Add public_success_nonce column to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS public_success_nonce TEXT;

-- Create stripe_webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT,
    stripe_session_id TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can interact with webhook events
CREATE POLICY "Service role can manage webhook events"
ON public.stripe_webhook_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);