

# Corrigir domínio de email nas Edge Functions

## Problema
O domínio configurado para envio de emails é `studio.artiscase.com`, mas ambas as Edge Functions (`notify-order-status` e `auth-email-hook`) referenciam `notify.studio.artiscase.com` — um subdomínio que não está registrado nem verificado.

## Correções

### 1. `supabase/functions/notify-order-status/index.ts`
- Linha 10: `SENDER_DOMAIN` de `"notify.studio.artiscase.com"` → `"studio.artiscase.com"`
- Linha 11: `FROM` de `"ArtisCase <noreply@notify.studio.artiscase.com>"` → `"ArtisCase <noreply@studio.artiscase.com>"`

### 2. `supabase/functions/auth-email-hook/index.ts`
- Linha 38: `SENDER_DOMAIN` de `"notify.studio.artiscase.com"` → `"studio.artiscase.com"`
- Linha 41: `FROM_DOMAIN` de `"notify.studio.artiscase.com"` → `"studio.artiscase.com"`

### 3. Re-deploy ambas as funções
Após as correções, fazer deploy de `notify-order-status` e `auth-email-hook`.

### Resultado
Os emails passarão a usar o domínio correto (`studio.artiscase.com`) que está efetivamente configurado e aguardando verificação DNS.

