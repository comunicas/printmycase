

## Análise: Emails de Compra e Status do Pedido

### Estado Atual

**O que existe:**
- Edge function `notify-order-status` — envia email ao cliente quando o admin muda o status do pedido
- Chamada pelo `OrdersManager.tsx` em 2 pontos: mudança de status e salvamento de código de rastreio
- Template HTML bonito com badge de status colorido, tracking link (para status "shipped"), logo e CTA

**Problemas identificados:**

1. **Nenhum email de confirmação de compra** — Quando o pagamento é confirmado pelo Stripe (`checkout.session.completed`), o webhook atualiza o status para "analyzing" e credita moedas bônus, mas NÃO envia email de confirmação ao cliente.

2. **Sem domínio de email configurado** — O workspace não tem nenhum domínio de email configurado. A function `notify-order-status` usa `sender_domain: "printmycase.com.br"` e `from: "noreply@printmycase.com.br"`, mas sem domínio verificado os emails provavelmente estão falhando silenciosamente (`.catch(() => {})` no frontend engole o erro).

3. **Logs zerados** — `notify-order-status` não tem NENHUM log, o que sugere que a function nunca foi chamada com sucesso ou nunca foi deployada.

4. **Erro silencioso no frontend** — As chamadas à function usam `.catch(() => {})`, escondendo qualquer falha.

### Plano de Correção

**Passo 1 — Configurar domínio de email**
- Necessário configurar um domínio de email para que os envios funcionem
- Sem isso, nenhum email transacional será entregue

**Passo 2 — Email de confirmação de compra (novo)**
- Adicionar envio de email no `stripe-webhook` quando `checkout.session.completed` for recebido para compras de case
- Template: "Pedido confirmado! #XXXXX — Em Análise", com dados do produto, valor, prazo estimado

**Passo 3 — Corrigir `notify-order-status`**
- Atualizar `sender_domain` para usar o subdomínio correto após configuração
- Adicionar logs detalhados: `[notify] Start`, `[notify] Email sent`, `[notify] Error`
- Deploy da function

**Passo 4 — Melhorar resiliência no frontend**
- Remover `.catch(() => {})` e logar erros no console ou mostrar toast de warning

**Passo 5 — Email de cancelamento/expiração**
- No webhook, quando `checkout.session.expired` → enviar email informando cancelamento

### Resultado esperado: emails em cada etapa

| Evento | Email | Responsável |
|--------|-------|-------------|
| Pagamento confirmado | "Pedido Confirmado — Em Análise" | `stripe-webhook` (novo) |
| Admin muda status | "Atualização de Status — {status}" | `notify-order-status` (existente) |
| Admin adiciona rastreio | "Pedido Enviado + Código de Rastreio" | `notify-order-status` (existente) |
| Session expirada | "Pedido Cancelado" | `stripe-webhook` (novo) |

### Pré-requisito crítico
Antes de implementar, é necessário configurar o domínio de email. Sem isso, nenhum email será enviado.

