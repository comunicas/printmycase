

## Proteger o edge function `cleanup-pending-checkouts` com CRON_SECRET

### O que será feito

1. **Criar o secret `CRON_SECRET`** — solicitar ao usuário que forneça um valor (string aleatória forte). Ele pode inventar qualquer valor, ex: `artiscase_cron_2024_xK9mP3nQ7w`.

2. **Atualizar `supabase/functions/cleanup-pending-checkouts/index.ts`** — adicionar validação do header `X-Cron-Secret` no início da função, retornando 401 se ausente ou inválido.

3. **Atualizar o cron job via SQL** — remover o job diário redundante e atualizar o job horário para incluir o header `X-Cron-Secret` na chamada HTTP.

### Detalhes técnicos

**Edge function** — adicionar antes do bloco try:
```typescript
const cronSecret = req.headers.get("x-cron-secret");
if (cronSecret !== Deno.env.get("CRON_SECRET")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**SQL para cron jobs** — unschedule o job diário e atualizar o horário com o novo header:
```sql
SELECT cron.unschedule('cleanup-pending-checkouts-daily');

SELECT cron.unschedule('cleanup-pending-checkouts-hourly');

SELECT cron.schedule(
  'cleanup-pending-checkouts-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://gfsbsgwxylvhnwbpcodj.supabase.co/functions/v1/cleanup-pending-checkouts',
    headers:=jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ANON_KEY',
      'X-Cron-Secret', current_setting('app.settings.cron_secret', true)
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

> Nota: o secret no cron será hardcoded no SQL pois `pg_cron` não acessa secrets de edge functions. O valor será o mesmo fornecido pelo usuário.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/cleanup-pending-checkouts/index.ts` | Adicionar validação de secret |
| Secret `CRON_SECRET` | Criar via ferramenta de secrets |
| SQL (cron jobs) | Atualizar via query direta |

