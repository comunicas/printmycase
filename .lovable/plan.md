

## Refatoração Completa do Sistema de Emails — Do Zero

### Estado Atual

- Domínio `printmycase.com.br` adicionado, status **Pendente** (NS records não verificados)
- `auth-email-hook` funcional com fila, mas templates sem logo
- `notify-order-status` usa HTML manual (template strings) e FROM incorreto (`noreply@notify.printmycase.com.br` em vez de `noreply@printmycase.com.br`)
- Não existe infraestrutura transacional (`send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression`)
- `process-email-queue` bem implementado, sem alterações necessárias

### DNS — Configuração Necessária

O subdomínio `notify.printmycase.com.br` precisa dos seguintes registros no provedor DNS de `printmycase.com.br` (Hostinger ou Registro.br):

| Tipo | Nome | Valor |
|------|------|-------|
| NS | notify | `ns3.lovable.cloud` |
| NS | notify | `ns4.lovable.cloud` |

Até que esses registros sejam verificados, nenhum email será enviado — mas toda a infraestrutura pode ser criada e deployada agora.

### Plano de Execução

| # | Ação | Detalhe |
|---|------|---------|
| 1 | Configurar infraestrutura de email | Criar tabelas, filas pgmq, RPCs, cron job (se não existirem) |
| 2 | Re-scaffoldar templates de autenticação | Recriar os 6 templates com logo PrintMyCase do bucket `email-assets` e branding consistente |
| 3 | Deploy auth-email-hook | Redeployar com templates atualizados |
| 4 | Scaffoldar infraestrutura transacional | Criar `send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression` e registry |
| 5 | Criar template `order-status-update` | Template React Email com logo, status badge, dados do pedido, rastreio (shipped), botão "Ver Meus Pedidos" |
| 6 | Refatorar `notify-order-status` | Remover HTML manual. Chamar `send-transactional-email` via `supabase.functions.invoke()`. Corrigir FROM para `noreply@printmycase.com.br` |
| 7 | Criar página de unsubscribe | Página no app para processar cancelamento de inscrição |
| 8 | Deploy de todas as Edge Functions | `auth-email-hook`, `send-transactional-email`, `handle-email-unsubscribe`, `handle-email-suppression`, `notify-order-status` |

### Correções Específicas no `notify-order-status`

- FROM: `noreply@notify.printmycase.com.br` → `noreply@printmycase.com.br`
- Remover construção de HTML manual (`buildEmailHtml`)
- Adicionar `message_id`, `run_id`, `label`, `text` (plaintext) ao payload
- Usar `send-transactional-email` em vez de enqueue direto

### Resultado Final

```text
supabase/functions/
├── _shared/
│   ├── email-templates/              ← Auth (6 templates com logo + branding)
│   └── transactional-email-templates/
│       ├── registry.ts
│       └── order-status-update.tsx
├── auth-email-hook/                  ← Re-scaffolded
├── send-transactional-email/         ← Novo
├── handle-email-unsubscribe/         ← Novo
├── handle-email-suppression/         ← Novo
├── process-email-queue/              ← Mantido
└── notify-order-status/              ← Refatorado
```

