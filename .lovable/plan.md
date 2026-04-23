
Objetivo: implementar rastreamento ponta a ponta dos fluxos `signup` e `recovery`, desde o `run_hook` disparado por `/signup` e `/recover` até a criação das linhas `pending` e `sent` em `email_send_log`, com correlação explícita por `message_id` e `idempotency_key`.

## Diagnóstico consolidado

Hoje o fluxo de auth já faz:
- `auth-email-hook` recebe o evento
- renderiza o template
- grava `pending` em `email_send_log`
- enfileira em `auth_emails`
- `process-email-queue` envia e grava `sent`

Mas ainda faltam 3 coisas para o rastreamento ficar realmente end-to-end:
1. `message_id` é gerado com `randomUUID()`, então não expressa a origem do `run_hook`
2. `idempotency_key` existe só no `metadata` e hoje replica o `message_id`, sem trilha forte para auditoria
3. não há um contexto de trace consistente carregando `run_id`, `action_type`, `message_id` e `idempotency_key` do hook até o dispatcher

## Problema técnico atual

### No `auth-email-hook`
- existe log `Received auth event`, mas sem checkpoints suficientes
- `message_id` é randômico
- `idempotency_key` é igual ao `message_id`
- a linha `pending` não preserva um bloco de trace completo para depuração posterior

### No `process-email-queue`
- a linha `sent` usa `payload.idempotency_key`, mas não propaga o contexto completo do hook
- o dispatcher não registra claramente o vínculo entre:
  - `run_id`
  - `action_type`
  - `message_id`
  - `idempotency_key`
  - `provider_message_id`

### No teste E2E atual
- ele valida chegada de `pending/sent`
- mas não valida a trilha inteira de correlação
- não prova que `pending` e `sent` pertencem ao mesmo rastreamento iniciado no `run_hook`

## O que será implementado

### Etapa 1 — Padronizar um trace context para auth emails
Criar um contexto de rastreamento único no `auth-email-hook` com campos como:
- `run_id`
- `hook_event_type`
- `action_type`
- `recipient_email`
- `message_id`
- `idempotency_key`
- `queue = auth_emails`

Esse objeto será a fonte única de verdade do fluxo.

### Etapa 2 — Tornar a correlação determinística no hook
Trocar a geração randômica atual por uma convenção estável baseada no `run_id`:

Exemplo de padrão:
```text
message_id       = auth-signup-{run_id}
idempotency_key  = auth-signup-{run_id}
message_id       = auth-recovery-{run_id}
idempotency_key  = auth-recovery-{run_id}
```

Se eu precisar separar semanticamente os dois campos, mantenho:
```text
message_id      = auth-{action_type}-{run_id}
idempotency_key = auth:{action_type}:{run_id}
```

Resultado:
- a origem do email fica legível
- retries do mesmo hook mantêm a mesma identidade
- o `pending` e o `sent` passam a ser correlacionáveis sem heurística

### Etapa 3 — Enriquecer a linha `pending` no `email_send_log`
A gravação `pending` no `auth-email-hook` passará a incluir, além do remetente:
- `idempotency_key`
- `run_id`
- `hook_event_type`
- `action_type`
- `queue`
- possivelmente `trace_stage = hook_pending_logged`

Se necessário para consulta mais forte, vou adicionar coluna dedicada `idempotency_key` em `email_send_log` via migration e continuar espelhando no `metadata`.

### Etapa 4 — Propagar o trace inteiro para a fila
O payload enviado ao `enqueue_email` passará a carregar:
- `message_id`
- `idempotency_key`
- `run_id`
- `action_type`
- `hook_event_type`
- `recipient_email`
- `queued_at`

Assim o dispatcher não depende só do que estava salvo no log inicial.

### Etapa 5 — Fechar a trilha no `process-email-queue`
A gravação `sent` passará a espelhar o mesmo contexto da `pending`, adicionando:
- `provider_message_id`
- `run_id`
- `message_id`
- `idempotency_key`
- `action_type`
- `queue`
- `trace_stage = dispatcher_sent`

Também vou reforçar logs estruturados do dispatcher para auth emails:
- claim da mensagem
- início do send
- sucesso com `provider_message_id`
- falha/rate limit com o mesmo par `message_id` + `idempotency_key`

### Etapa 6 — Instrumentar logs estruturados no hook
Adicionar checkpoints explícitos no `auth-email-hook`:
- hook recebido
- template resolvido
- `pending` persistido
- enqueue concluído
- erro de persistência
- erro de enqueue

Todos com:
- `run_id`
- `action_type`
- `message_id`
- `idempotency_key`
- `recipient_email`

Isso permite validar o começo do fluxo mesmo quando houver problema entre hook e fila.

### Etapa 7 — Reforçar o teste E2E de `signup`
Atualizar `supabase/functions/auth-email-hook/index.test.ts` para:
- disparar `/auth/v1/signup` com usuário novo
- aguardar linhas `pending` e `sent`
- validar que ambas têm:
  - o mesmo `message_id`
  - o mesmo `idempotency_key`
  - `template_name = signup`
  - `recipient_email` igual ao usuário criado
  - `provider_message_id` preenchido na `sent`
  - remetente correto
- validar também que a identidade do trace carrega `run_id`/origem do hook no `metadata`

### Etapa 8 — Reforçar o teste E2E de `recovery`
Fazer o mesmo para `/auth/v1/recover`:
- dispara recovery para o mesmo usuário
- aguarda `pending` + `sent`
- valida:
  - mesmo `message_id`
  - mesmo `idempotency_key`
  - `template_name = recovery`
  - remetente correto
  - `provider_message_id` presente
  - contexto de trace preservado do hook ao dispatcher

## Mudanças previstas por arquivo

### `supabase/functions/auth-email-hook/index.ts`
- gerar `message_id` e `idempotency_key` determinísticos por `run_id`
- criar objeto de trace
- enriquecer `pending`
- propagar trace completo no payload da fila
- adicionar logs estruturados de cada checkpoint

### `supabase/functions/process-email-queue/index.ts`
- ler trace do payload da fila
- gravar `sent` com os mesmos campos de correlação
- incluir `provider_message_id`
- logar o caminho auth queue -> provider -> `email_send_log`

### `supabase/functions/auth-email-hook/index.test.ts`
- fortalecer helpers para validar correlação
- testar `signup`
- testar `recovery`
- verificar que `pending` e `sent` pertencem ao mesmo trace

### `supabase/migrations/...` (se necessário)
Adicionar coluna/index de apoio para observabilidade:
- `idempotency_key text`
- índice para consulta por `idempotency_key`

Isso evita depender apenas de filtro em JSON quando precisarmos auditar rapidamente os fluxos.

## Estratégia de correlação final

```text
/signup
  -> run_hook(auth-email-hook)
    -> run_id recebido
    -> message_id/idempotency_key derivados do run_id
    -> pending gravado no email_send_log
    -> payload enfileirado com os mesmos IDs
    -> process-email-queue lê payload
    -> envia via provider
    -> sent gravado com o mesmo message_id/idempotency_key + provider_message_id
```

Mesmo raciocínio para `/recover`.

## Critérios de aceite

### Signup
- `/signup` dispara o hook
- existe 1 linha `pending` e 1 linha `sent`
- ambas compartilham o mesmo `message_id`
- ambas compartilham o mesmo `idempotency_key`
- a `sent` contém `provider_message_id`
- o `metadata` permite relacionar o fluxo ao `run_hook`

### Recovery
- `/recover` dispara o hook
- existe 1 linha `pending` e 1 linha `sent`
- ambas compartilham o mesmo `message_id`
- ambas compartilham o mesmo `idempotency_key`
- a `sent` contém `provider_message_id`
- o `metadata` permite relacionar o fluxo ao `run_hook`

## Resultado esperado
Depois da implementação, será possível seguir cada envio de `signup` e `recovery` ponta a ponta com uma trilha auditável e estável:
- origem no `run_hook`
- persistência `pending`
- enqueue
- envio no dispatcher
- persistência `sent`

Tudo correlacionado por `message_id` e `idempotency_key`, sem depender de UUIDs soltos ou inferência manual.
