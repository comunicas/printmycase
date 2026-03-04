

## Análise dos Logs de Email

### Diagnóstico

O domínio de email customizado `notify.studio.artiscase.com` está com status **Pendente** — a configuração DNS ainda não foi concluída. Isso significa que:

1. **Emails de autenticação** (verificação de conta, reset de senha) estão sendo enviados pelo sistema padrão do Lovable, não pelo template customizado. O email que você recebeu do último usuário veio desse sistema padrão.

2. **Emails de notificação de pedido** (`notify-order-status`) — os logs mostram apenas inicialização da função ("booted"), sem registros de envio real. Isso pode significar que a função não está sendo chamada, ou que os emails estão falhando silenciosamente porque o domínio `studio.artiscase.com` não está verificado para envio transacional.

### O que precisa ser feito

**Não há mudanças de código necessárias.** O problema é de configuração DNS:

1. **Verificar DNS do domínio de email** — Acesse as configurações de email do projeto e complete a configuração DNS para `notify.studio.artiscase.com`. São registros CNAME/TXT que precisam ser adicionados no seu provedor de DNS.

2. **Aguardar propagação** — Após configurar os registros DNS, a verificação pode levar de minutos a algumas horas.

3. **Após verificação** — Os emails customizados (tanto de autenticação quanto de notificação de pedido) passarão a funcionar automaticamente pelo domínio verificado.

### Sobre os emails de notificação de pedido

Os logs de `notify-order-status` mostram apenas boot da função. Para confirmar se ela está sendo chamada corretamente ao atualizar status de pedidos, seria necessário testar uma atualização de status no painel admin após a verificação DNS estar concluída.

