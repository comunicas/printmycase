

## Análise

O `create-checkout` funciona porque usa o padrão: cria client anon com header de Authorization e chama `auth.getUser(token)` passando o token explicitamente. O `notify-order-status` atual chama `auth.getUser()` sem o token, o que pode falhar.

## Plano

Ajustar `notify-order-status` para usar o mesmo padrão do `create-checkout`:

1. Criar client com `SUPABASE_ANON_KEY` + header `Authorization`
2. Chamar `auth.getUser(token)` passando o token explicitamente
3. Manter o `supabaseAdmin` com service-role para operações admin

Alteração mínima nas linhas 122-135 do arquivo `supabase/functions/notify-order-status/index.ts`.

