

# Diagnóstico: Emails não funcionam

## Problemas encontrados

### 1. Função `notify-order-status` não está registrada no config.toml
A função existe no código mas **não está listada** em `supabase/config.toml`. Isso significa que ela nunca foi deployada e qualquer chamada a ela retorna erro. Precisa adicionar a entrada com `verify_jwt = false` (a função faz validação de JWT internamente).

### 2. Domínio de email com DNS pendente
O domínio `notify.studio.artiscase.com` está com status **Pending** — os registros DNS ainda não foram verificados. Enquanto o DNS não estiver verificado, nenhum email (transacional ou de autenticação) será enviado por esse domínio.

## Plano de correção

### Arquivo: `supabase/config.toml`
- Adicionar entrada `[functions.notify-order-status]` com `verify_jwt = false`

### Deploy
- Fazer deploy da edge function `notify-order-status` após a correção do config

### DNS (ação do usuário)
- O usuário precisa configurar os registros DNS do domínio `notify.studio.artiscase.com` no provedor de DNS. Isso pode ser verificado em **Cloud → Email**.

