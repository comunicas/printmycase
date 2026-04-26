-- Substituir o cron job para usar o service role key (já no Vault como 'email_queue_service_role_key')
DO $$
DECLARE
  v_supabase_url text := 'https://iqnqpwnbdqzvqssxcxgb.supabase.co';
BEGIN
  -- Remove job antigo se existir
  PERFORM cron.unschedule('send-abandoned-cart-reminders-every-30min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-abandoned-cart-reminders-every-30min');

  -- Re-agenda usando o service role key do Vault como Bearer
  PERFORM cron.schedule(
    'send-abandoned-cart-reminders-every-30min',
    '*/30 * * * *',
    format($job$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1)
        ),
        body := jsonb_build_object('triggered_at', now())
      );
    $job$, v_supabase_url || '/functions/v1/send-abandoned-cart-reminders')
  );
END $$;