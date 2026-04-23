CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_pending_unique
  ON public.email_send_log(message_id)
  WHERE status = 'pending' AND message_id IS NOT NULL;