
Objetivo: padronizar toda a stack de emails para que autenticação, onboarding, moedas e compra usem o mesmo padrão visual, o mesmo remetente lógico, a mesma trilha de observabilidade e a mesma regra de idempotência, eliminando a diferença atual entre auth e app emails.

## Diagnóstico consolidado

Hoje existem dois caminhos diferentes:

### 1) Auth emails
- `auth-email-hook` renderiza os templates customizados (`signup`, `recovery`, etc.)
- depois enfileira em `auth_emails`
- o dispatcher `process-email-queue` envia via pipeline gerenciada (`sendLovableEmail`)
- por isso auth hoje não segue exatamente o mesmo provedor/caminho dos app emails

### 2) App emails
- `send-transactional-email` renderiza templates do registry
- envia diretamente via `sendWithResend`
- grava `pending/sent/suppressed/failed` no `email_send_log`
- `coin-purchase-confirmation` já foi parcialmente consolidado para entrar por esse caminho

### Consequência prática
- signup/recovery podem sair com comportamento diferente dos demais
- há diferença de provedor, rastreabilidade e troubleshooting
- o branding ficou parcialmente consistente nos templates, mas não no pipeline inteiro
- ainda existe risco de divergência futura entre auth e app emails

## Padrão final proposto

### Meta
Unificar tudo em um modelo único com 4 pilares:

1. Mesmo padrão visual  
2. Mesmo padrão de remetente  
3. Mesma observabilidade (`email_send_log`)  
4. Mesmas regras de idempotência e erro

### Decisão de arquitetura
Padronizar auth e app emails no mesmo provedor de envio já usado pelos demais emails do produto.

Na prática:
- manter `auth-email-hook` como ponto obrigatório de entrada dos eventos de autenticação
- manter os templates próprios de auth
- trocar o dispatcher de `auth_emails` para usar o mesmo mecanismo de envio dos app emails
- preservar a fila, prioridade e retry do fluxo de auth
- preservar o `email_send_log` como trilha única de auditoria

## O que será implementado

### Etapa 1 — Unificar o dispatcher
Atualizar `process-email-queue` para que:
- mensagens de `auth_emails` também sejam enviadas pelo mesmo sender usado em `send-transactional-email`
- continue existindo prioridade para `auth_emails`
- continue existindo retry, DLQ e TTL
- `provider_message_id` seja gravado de forma uniforme para auth e app emails

Resultado:
- signup/recovery passam a usar o mesmo provedor dos outros emails
- a diferença entre “auth email” e “app email” fica só no gatilho/template, não no transporte

### Etapa 2 — Normalizar payload e metadados
Padronizar os campos de fila/log para ambos os tipos:
- `message_id`
- `template_name`
- `recipient_email`
- `idempotency_key`
- `provider`
- `provider_message_id`

Também alinhar:
- nome do template gravado no log
- from display name
- from email
- tags/metadados de provider quando suportados

### Etapa 3 — Padronizar visual de todos os auth templates
Hoje `signup` e `recovery` já estão mais próximos do padrão, mas outros auth templates ainda estão no scaffold genérico.

Vou alinhar também:
- `magic-link.tsx`
- `invite.tsx`
- `email-change.tsx`
- `reauthentication.tsx`

Padrão visual único:
- logo PrintMyCase
- tipografia Inter
- cor primária `hsl(265, 83%, 57%)`
- fundo branco
- cards suaves
- CTA com raio grande (`24px`)
- copy em PT-BR
- tom consistente com welcome/coins/order emails

### Etapa 4 — Padronizar assuntos e copy
Revisar todos os assuntos e microcopy para manter consistência entre:
- cadastro
- recuperação
- link mágico
- convite
- troca de email
- reautenticação
- boas-vindas
- compra de moedas
- compra/pedido

Padrão editorial:
- PT-BR
- linguagem direta
- foco em “capinha”, conta, moedas e compra
- sem mistura de inglês/default scaffold

### Etapa 5 — Consolidar definitivamente coins
Fechar o fluxo do `coin-purchase-confirmation` para que:
- o disparo aconteça só após crédito confirmado
- a chamada seja sempre idempotente por sessão
- o `email_send_log` registre `pending` e `sent`
- não haja duplicidade entre webhook e verificação posterior

### Etapa 6 — Revisar padronização do pedido
Conferir se o email de compra/pedido segue o mesmo padrão de:
- branding
- assunto
- log
- remetente
- idempotência

E alinhar a definição do primeiro status enviado ao cliente:
- `analyzing` ou equivalente final aprovado no fluxo

## Arquivos a ajustar

### Dispatcher / envio
- `supabase/functions/process-email-queue/index.ts`
- possivelmente `supabase/functions/_shared/resend.ts` para suportar uso compartilhado no dispatcher

### Auth
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/_shared/email-templates/signup.tsx`
- `supabase/functions/_shared/email-templates/recovery.tsx`
- `supabase/functions/_shared/email-templates/magic-link.tsx`
- `supabase/functions/_shared/email-templates/invite.tsx`
- `supabase/functions/_shared/email-templates/email-change.tsx`
- `supabase/functions/_shared/email-templates/reauthentication.tsx`

### App emails / coins / compra
- `supabase/functions/_shared/transactional-email.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/verify-coin-purchase/index.ts`
- se necessário, templates em `_shared/transactional-email-templates/`

## Regras que serão preservadas
- `auth-email-hook` continua existindo e continua sendo a entrada dos eventos de auth
- filas continuam sendo usadas
- auth continua prioritário
- retry/DLQ/TTL continuam ativos
- não haverá envio em massa nem mudança para emails de marketing

## Dependência externa importante
O domínio `notify.printmycase.com.br` ainda está pendente.

Isso significa:
- posso padronizar o código e o pipeline agora
- mas o comportamento final de remetente/entrega só ficará 100% consistente quando a ativação do domínio terminar no backend de emails

## Critérios de aceite

### Auth
- `signup` e `recovery` usam o mesmo provedor/caminho dos demais emails
- deixam de ter aparência/caminho divergente
- registram `pending` + `sent` com `provider_message_id`
- chegam com branding PrintMyCase em PT-BR

### App emails
- `welcome-email`, `coin-purchase-confirmation` e compra/pedido seguem exatamente o mesmo padrão visual e de log
- coin purchase dispara uma única vez após crédito confirmado

### Plataforma inteira
- mesma identidade visual em todos os templates
- mesma trilha de observabilidade
- mesmo padrão de remetente
- mesma convenção de idempotência
- menor diferença operacional entre auth e app emails

## Resultado esperado
Ao final, “padronizar tudo” significará:
- um único padrão de envio
- um único padrão de branding
- um único padrão de logs
- um único padrão de confiabilidade

Com isso, signup/recovery deixam de ser uma exceção e passam a fazer parte da mesma esteira dos outros emails do produto.
