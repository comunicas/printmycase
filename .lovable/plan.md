

# Resultado do Teste — Notificação de Email

## Status atual do domínio

O domínio `notify.studio.artiscase.com` ainda está com status **⏳ Pending**. Isso significa que os registros DNS adicionados na Hostinger **ainda não foram verificados** pelo Lovable.

## O que isso implica

**Nenhum email será enviado** enquanto o domínio estiver pendente — tanto emails de autenticação (confirmação de conta, recuperação de senha) quanto notificações de pedido passam pelo mesmo domínio `notify.studio.artiscase.com`.

Mesmo que a Edge Function `notify-order-status` esteja corretamente implementada e deployed, a chamada a `sendLovableEmail` vai falhar ou ser rejeitada porque o `sender_domain` não está verificado.

## O que verificar na Hostinger

Confirme que os registros existem exatamente assim (use [DNSChecker.org](https://dnschecker.org) para validar):

| Tipo | Host | Valor esperado |
|------|------|----------------|
| **A** | `notify.studio` | `185.158.133.1` |
| **TXT** | `_lovable.notify.studio` | `lovable_verify=2d3faca428bfd9de03121a436792f756d0d31a00e6a70d38b63be844f39200db` |

### Erros comuns na Hostinger

1. **Host com `.artiscase.com` duplicado** — se a Hostinger adiciona automaticamente o domínio raiz, colocar `notify.studio.artiscase.com` vira `notify.studio.artiscase.com.artiscase.com`. Use apenas `notify.studio`.
2. **CNAME conflitante** — se existe um CNAME para `notify.studio`, ele impede o registro A de funcionar. Delete o CNAME primeiro.
3. **TTL alto** — se o TTL foi configurado acima de 3600, a propagação pode levar mais tempo.

## Próximos passos

1. Verifique os registros DNS no [DNSChecker.org](https://dnschecker.org/?domain=notify.studio.artiscase.com&rtype=A)
2. Se os registros não aparecem, corrija na Hostinger
3. Quando o domínio mudar para **Active**, me avise e eu faço o teste completo disparando a notificação via a Edge Function

Não há mudança de código necessária — o bloqueio é exclusivamente DNS.

