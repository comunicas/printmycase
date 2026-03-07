

## Configurar Cron Job para Limpeza de Rascunhos Abandonados

### Passos de implementação

1. **Habilitar extensões `pg_cron` e `pg_net`** — migration SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
   CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
   ```

2. **Criar o cron job** — SQL direto (não migration, contém anon key):
   ```sql
   SELECT cron.schedule(
     'cleanup-pending-checkouts-hourly',
     '0 * * * *',
     $$
     SELECT net.http_post(
       url := 'https://gfsbsgwxylvhnwbpcodj.supabase.co/functions/v1/cleanup-pending-checkouts',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc2JzZ3d4eWx2aG53YnBjb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTg2NzQsImV4cCI6MjA4ODAzNDY3NH0.7iMjARkQzBSND95EPGnnoYWfGqwcchswUbT5TZyu3nk"}'::jsonb,
       body := '{}'::jsonb
     ) AS request_id;
     $$
   );
   ```

3. **Adicionar `cleanup-pending-checkouts` ao `config.toml`** com `verify_jwt = false`

### Detalhes técnicos

- A edge function `cleanup-pending-checkouts/index.ts` já existe e funciona (deleta registros > 30 dias + arquivos do bucket `customizations`)
- O cron roda a cada hora inteira (minuto 0)
- Extensões são criadas no schema `extensions` (padrão Supabase)
- Nenhuma alteração frontend necessária

