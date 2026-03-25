

## Corrigir domínio do app nos emails de autenticação

### Problema

O `auth-email-hook` tem `ROOT_DOMAIN = "printmycase.com.br"`, fazendo os links dos emails de autenticação apontarem para `https://printmycase.com.br` em vez de `https://studio.printmycase.com.br`.

### Alteração

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `supabase/functions/auth-email-hook/index.ts` | Alterar `ROOT_DOMAIN` para `"studio.printmycase.com.br"`. Alterar `SAMPLE_PROJECT_URL` para `"https://studio.printmycase.com.br"`. Manter `SENDER_DOMAIN` e `FROM_DOMAIN` como estão (o envio continua via `printmycase.com.br`). |

### O que NÃO muda
- `SENDER_DOMAIN = "notify.printmycase.com.br"` — correto, é o subdomínio de envio
- `FROM_DOMAIN = "printmycase.com.br"` — correto, é o domínio no remetente (`noreply@printmycase.com.br`)
- Domínio de email configurado (`printmycase.com.br`) — correto, o NS do `notify` precisa ser verificado no provedor de DNS de `printmycase.com.br`

### Sobre o DNS
O status do domínio de email está como **pendente**. Os NS records (`ns3.lovable.cloud` e `ns4.lovable.cloud`) para o subdomínio `notify` precisam estar configurados no provedor que gerencia o DNS de `printmycase.com.br` — seja Registro.br ou Hostinger, dependendo de para onde os NS do domínio raiz apontam.

