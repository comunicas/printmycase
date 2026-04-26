SELECT net.http_post(
  url := 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/functions/v1/send-transactional-email',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1)
  ),
  body := jsonb_build_object(
    'templateName', 'abandoned-cart-reminder',
    'recipientEmail', 'feahorita@gmail.com',
    'idempotencyKey', 'abandoned-cart-test-' || replace(gen_random_uuid()::text, '-', ''),
    'templateData', jsonb_build_object(
      'userName', 'Fernanda',
      'productName', 'Capa Personalizada iPhone 15 Pro',
      'productImageUrl', 'https://printmycase.com.br/placeholder.svg',
      'resumeUrl', 'https://printmycase.com.br/customize/capa-iphone-15-pro',
      'step', 1
    )
  )
);