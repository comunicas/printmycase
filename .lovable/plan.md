
Objetivo: fechar a tarefa apenas quando houver evidência operacional dos fluxos críticos já implementados. Pela revisão atual, o escopo está quase completo, mas ainda existem pendências importantes antes de considerar 100% concluído.

## Status atual

### Já está implementado no código
- Emails de autenticação via `auth-email-hook`:
  - `signup`
  - `invite`
  - `magiclink`
  - `recovery`
  - `email_change`
  - `reauthentication`
- Emails do app já registrados no sender central:
  - `welcome-email`
  - `contact-confirmation`
  - `contact-notification`
  - `coin-purchase-confirmation`
  - `order-status-update`
- Observabilidade reforçada:
  - `auth-email-hook` já tenta registrar `pending`, `sent` e `failed`
  - `send-transactional-email` já tem deduplicação/idempotência e grava `email_send_log`
  - `provider_message_id` é persistido em `metadata` quando disponível
- Documentação já atualizada em `ARCHITECTURE.md` com a matriz de emails

### Evidência já encontrada
- `welcome-email` tem log recente de envio com sucesso em produção
- O fluxo de boas-vindas está funcional no backend e no gatilho do `AuthContext`

## Pendências importantes antes de fechar

### 1) Validar auth de forma conclusiva
Ainda falta evidência final de produção para os dois fluxos mínimos de auth:
- `signup`
- `recovery`

O ponto de fechamento não é só “hook executou”, e sim confirmar no `email_send_log`:
- registro `pending`
- registro `sent`
- `provider_message_id`
- remetente final correto

### 2) Validar compra de moedas em produção
O email `coin-purchase-confirmation` está implementado e ligado em:
- `stripe-webhook`
- `verify-coin-purchase`

Mas não há evidência revisada nesta auditoria de:
- envio real em produção
- registro correspondente no `email_send_log`
- confirmação de que a idempotência está funcionando no cenário real

### 3) Validar fluxo de pedido em produção
`order-status-update` existe e está integrado, mas ainda precisa evidência real para pelo menos:
- confirmação inicial de pedido
- `shipped` com rastreio
- `delivered` ou `cancelled`

Sem isso, o fluxo está implementado, mas ainda não está “fechado” operacionalmente.

### 4) Revisar pequena inconsistência documental/funcional do pedido
A documentação diz que o pedido está coberto desde a confirmação inicial, mas nesta revisão ainda é necessário confirmar se o primeiro email realmente está sendo disparado no evento inicial esperado, e qual status o cliente recebe primeiro:
- `paid`
- ou `analyzing`

Isso precisa ficar consistente entre:
- `ARCHITECTURE.md`
- `stripe-webhook`
- template `order-status-update`
- regra de negócio do pedido

## Decisão recomendada
Ainda não fechar a tarefa como concluída.

Ela pode ser considerada em fase final, com implementação praticamente pronta, mas ainda com pendências de validação operacional dos fluxos mais importantes.

## Próximos passos para fechar de verdade

### Etapa 1 — Validar auth
Executar e registrar evidência para:
- `signup`
- `recovery`

Critério:
- email recebido
- `email_send_log` com `pending` + `sent`
- `provider_message_id` presente

### Etapa 2 — Validar moedas
Executar uma compra real/controlada de moedas e confirmar:
- crédito efetivo
- envio de `coin-purchase-confirmation`
- log completo no `email_send_log`
- ausência de duplicidade entre webhook e verificação manual

### Etapa 3 — Validar pedido
Executar um caso controlado de pedido e confirmar:
- email inicial de confirmação/status
- `shipped` com tracking
- `delivered` ou `cancelled`
- consistência do assunto e conteúdo por status

### Etapa 4 — Ajuste final de alinhamento
Se necessário, alinhar a definição do “primeiro email do pedido” para evitar ambiguidade entre:
- pagamento confirmado
- pedido recebido
- analyzing

## Critério final de encerramento
A tarefa pode ser fechada quando houver evidência concreta, em produção, de:

- auth:
  - `signup`
  - `recovery`
- onboarding:
  - `welcome-email`
- moedas:
  - `coin-purchase-confirmation`
- pedido:
  - confirmação inicial
  - `shipped`
  - `delivered` ou `cancelled`

E, em todos eles:
- remetente correto
- `email_send_log` preenchido
- `provider_message_id` quando aplicável
- sem duplicidade indevida

## Conclusão
Resposta objetiva: ainda há pendências importantes, mas agora são principalmente de validação operacional, não mais de construção estrutural. O código-base e a matriz principal de emails já estão montados; o que falta para encerrar com segurança é provar em produção os fluxos críticos de auth, moedas e pedido.
