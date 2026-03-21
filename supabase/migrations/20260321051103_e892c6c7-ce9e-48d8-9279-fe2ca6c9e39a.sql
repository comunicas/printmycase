ALTER TABLE public.coin_transactions ADD COLUMN stripe_session_id text;

CREATE UNIQUE INDEX idx_coin_tx_stripe_session ON public.coin_transactions(stripe_session_id) WHERE stripe_session_id IS NOT NULL;