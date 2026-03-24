

## Revisão e Correção do Sistema de Emails

### Diagnóstico

Encontrei **3 problemas** que explicam por que os emails não estão funcionando:

1. **DNS pendente** — O domínio `notify.printmycase.com.br` está com status "Pending". Os registros NS não foram configurados (ou ainda não propagaram) no provedor de domínio. Sem isso, nenhum email é enviado.

2. **auth-email-hook desatualizado** — O hook de emails de autenticação (confirmação de conta, recuperação de senha, etc.) usa o padrão antigo de envio direto. Precisa ser atualizado para usar a fila de mensagens, garantindo retentativas automáticas em caso de falha.

3. **SENDER_DOMAIN errado no auth-email-hook** — Está configurado como `printmycase.com.br` (domínio raiz), mas deveria ser `notify.printmycase.com.br` (subdomínio verificado). Isso faz a API rejeitar todos os envios de emails de autenticação.

O `notify-order-status` (emails transacionais de pedidos) já está correto — usa a fila e o subdomínio certo.

### Plano de Ação

| # | Ação | Detalhes |
|---|------|----------|
| 1 | **Completar configuração DNS** | Acessar Cloud → Emails e verificar/completar os registros NS no provedor de domínio. Sem isso, nada funciona. |
| 2 | **Atualizar auth-email-hook** | Re-scaffoldar o hook para usar o padrão baseado em fila (`enqueue_email`) ao invés do envio direto (`sendLovableEmail`). Isso adiciona retentativas automáticas e resiliência. |
| 3 | **Corrigir SENDER_DOMAIN** | Alterar de `printmycase.com.br` para `notify.printmycase.com.br` no auth-email-hook após o re-scaffold. |
| 4 | **Deploy do auth-email-hook** | Reimplantar a função atualizada. |
| 5 | **Verificar cron job** | Confirmar que o job `process-email-queue` existe e está rodando a cada 5 segundos para processar a fila. |

### Alternativas?

O sistema atual (Lovable Emails com fila pgmq) é a melhor opção para este projeto — já está parcialmente configurado e não requer API keys ou contas externas. O único bloqueio real é o DNS pendente.

Não há necessidade de trocar para outro serviço. Uma vez que o DNS propagar e os fixes acima forem aplicados, tanto os emails de autenticação quanto os de notificação de pedidos vão funcionar com retentativas automáticas.

### Próximo passo imediato

Completar a configuração DNS em Cloud → Emails. Posso então aplicar os fixes técnicos (steps 2-5) em seguida.

