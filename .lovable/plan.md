

# Diagnóstico: DNS do domínio de email `notify.studio.artiscase.com`

## Situação Atual

O domínio de email `notify.studio.artiscase.com` está com status **Pending** — a verificação DNS ainda não foi concluída. Isso significa que **nenhum email** (autenticação ou notificação de pedido) será enviado pelo domínio customizado até que o DNS esteja correto.

A screenshot mostra que o domínio `notify.studio.artiscase.com` também está como **Verifying** na seção de domínios customizados (hosting). São duas verificações separadas mas usam registros semelhantes.

## O que você precisa fazer na Hostinger

No painel DNS do domínio `artiscase.com` na Hostinger, adicione estes registros (como `notify.studio` é um sub-subdomínio de `artiscase.com`):

| Tipo | Host/Nome | Valor |
|------|-----------|-------|
| **A** | `notify.studio` | `185.158.133.1` |
| **TXT** | `_lovable.notify.studio` | `lovable_verify=2d3faca428bfd9de03121a436792f756d0d31a00e6a70d38b63be844f39200db` |

**Dica importante**: Na Hostinger, o campo "Host" geralmente pede apenas o prefixo (sem o `.artiscase.com`). Então coloque exatamente `notify.studio` e `_lovable.notify.studio`.

Se a Hostinger já tem registros conflitantes para `notify.studio` (como CNAME), remova-os antes de adicionar o registro A.

## Após adicionar os registros

- A propagação DNS pode levar até 72 horas, mas geralmente leva minutos a poucas horas.
- Use [DNSChecker.org](https://dnschecker.org) para verificar se `notify.studio.artiscase.com` já aponta para `185.158.133.1`.
- Depois que o DNS propagar, tanto o domínio customizado quanto o domínio de email serão verificados automaticamente pelo Lovable.

## Sobre o código

O código das edge functions (`auth-email-hook` e `notify-order-status`) está correto e pronto — ambos já usam `notify.studio.artiscase.com` como `sender_domain`. Não há correção de código necessária. O único bloqueio é a configuração DNS na Hostinger.

## Nenhuma mudança de código necessária

Este é um problema exclusivamente de configuração DNS. Assim que os registros forem adicionados e propagados, os emails começarão a funcionar automaticamente.

