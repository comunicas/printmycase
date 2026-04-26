-- Agendar lembretes de carrinho abandonado a cada 30 minutos
-- A função usa CRON_SECRET (já existente nos secrets das edge functions).
-- Buscamos o valor do Vault; se não existir, criamos com placeholder que admin atualizará.

DO $$
DECLARE
  v_cron_secret text;
  v_supabase_url text := 'https://iqnqpwnbdqzvqssxcxgb.supabase.co';
BEGIN
  -- Tenta ler segredo já presente
  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets
  WHERE name = 'cron_secret'
  LIMIT 1;

  IF v_cron_secret IS NULL THEN
    -- Cria placeholder (admin atualizará via Vault). Evita falha do cron.
    PERFORM vault.create_secret('PLACEHOLDER_UPDATE_ME', 'cron_secret', 'Secret usado pelos cron jobs para autenticar contra edge functions');
  END IF;

  -- Remove job antigo se existir
  PERFORM cron.unschedule('send-abandoned-cart-reminders-every-30min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-abandoned-cart-reminders-every-30min');

  -- Agenda novo job
  PERFORM cron.schedule(
    'send-abandoned-cart-reminders-every-30min',
    '*/30 * * * *',
    format($job$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
        ),
        body := jsonb_build_object('triggered_at', now())
      );
    $job$, v_supabase_url || '/functions/v1/send-abandoned-cart-reminders')
  );
END $$;