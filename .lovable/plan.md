
Objetivo: corrigir o envio duplicado do welcome email para novos usuários, validar o fluxo real de signup com um novo usuário e eliminar a condição de corrida que hoje permite dois disparos antes da idempotência ser registrada.

## Diagnóstico

### O que já ficou evidente
- O email de ativação/signup chegou, então o fluxo principal de auth está funcionando.
- O usuário recebeu 2 emails de boas-vindas.
- Os logs do sender mostram duas execuções quase simultâneas do `welcome-email`.
- Também há erro de chave única no `email_send_log` para status `sent`:
  - `idx_email_send_log_message_sent_unique`
  - `message_id = welcome-{userId}`

### Causa raiz provável
Hoje o disparo de welcome no frontend acontece em `src/contexts/AuthContext.tsx` dentro de um `useEffect` dependente de:
- `user.id`
- `user.email`
- `user.email_confirmed_at`

Esse mesmo estado pode ser atualizado por mais de um caminho:
- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange(...)`

Como o flag em `sessionStorage` só é salvo depois do retorno bem-sucedido da função, duas execuções concorrentes podem acontecer antes do bloqueio local entrar em vigor.

Além disso, o backend atual de `send-transactional-email` faz uma checagem de idempotência antes do envio, mas ainda existe janela de corrida:
1. chamada A verifica e não encontra `pending/sent`
2. chamada B verifica e não encontra `pending/sent`
3. as duas enviam
4. apenas uma consegue gravar `sent`; a outra bate na unique constraint

Conclusão: a duplicidade não é só de log; ela pode realmente gerar dois envios.

## O que será corrigido

### 1) Blindagem no frontend do welcome email
Ajustar `src/contexts/AuthContext.tsx` para impedir reentrância no mesmo ciclo de sessão:
- adicionar trava em memória com `useRef`
- marcar o envio como “em andamento” antes de chamar a função remota
- manter o `sessionStorage` como persistência complementar
- garantir que `getSession` + `onAuthStateChange` não disparem dois invokes simultâneos

Resultado esperado:
- o navegador dispara no máximo uma tentativa de welcome por usuário/sessão

### 2) Blindagem forte no backend contra condição de corrida
Reforçar `supabase/functions/send-transactional-email/index.ts` para que o `welcome-email` seja idempotente antes do envio real, não apenas no log final.

Ajuste previsto:
- usar um lock lógico persistente via `email_send_log` logo no início
- tratar conflito/duplicidade como sucesso silencioso sem reenviar
- garantir que a segunda chamada concorrente saia antes do `sendWithResend`

Como a tabela hoje é append-only, a implementação deve seguir esse modelo e evitar update destrutivo. A ideia é usar o próprio `message_id`/`pending` como barreira operacional e tratar conflito como “já em processamento”.

Resultado esperado:
- mesmo que o frontend chame duas vezes, apenas uma chamada envia

### 3) Revisar o comportamento do teste E2E com novo usuário
Atualizar o teste de ponta a ponta em `supabase/functions/auth-email-hook/index.test.ts` para validar melhor o fluxo real:
- continuar criando um usuário novo
- validar `signup` com `pending/sent`
- validar `recovery` com `pending/sent`
- opcionalmente acrescentar checagem de que o `welcome-email` exista no máximo uma vez por `message_id` quando o usuário confirmar/entrar no app, sem acoplar o teste de auth a timing instável de UI

Importante:
- o teste atual cobre auth email/log
- o bug relatado agora é no welcome, que nasce no app após autenticação/sessão
- por isso o teste de auth pode continuar separado, e o welcome deve ganhar validação específica

### 4) Tratar o erro de log duplicado sem deixar ruído operacional
Hoje os logs mostram erro de constraint para um caso que deve ser entendido como duplicata inofensiva após a correção.
Vou ajustar o tratamento para:
- reconhecer conflito esperado de idempotência
- evitar poluição de erro quando a segunda chamada for barrada corretamente
- manter logs úteis para falhas reais

## Arquivos a ajustar
- `src/contexts/AuthContext.tsx`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/auth-email-hook/index.test.ts`

Se necessário para robustez adicional:
- `supabase/migrations/...` para adicionar um índice/regra auxiliar de idempotência específico de “pending lock”, sem quebrar o modelo append-only

## Estratégia técnica

### Frontend
Aplicar padrão:
- `welcomeSentRef`
- `welcomeInFlightRef`
- checagem antecipada antes do invoke
- set da trava antes do await

Fluxo:
```text
session resolvida
  -> usuário confirmado?
    -> já enviado ou em andamento? sai
    -> marca em andamento
    -> chama sender
    -> sucesso: marca sessionStorage
    -> finaliza trava
```

### Backend
Fortalecer a sequência:
```text
recebe request
  -> verifica idempotência
  -> tenta registrar lock inicial do message_id
  -> se lock já existe, retorna duplicate=true
  -> só então renderiza/envia
  -> registra sent/failure
```

Isso fecha a janela de corrida que hoje permite dois envios antes da unique constraint de `sent`.

## Critérios de aceite
A tarefa poderá ser considerada fechada quando houver evidência de que:

### Signup / recovery
- um novo usuário recebe o email de ativação com remetente correto
- `signup` grava `pending` e `sent` no `email_send_log`
- `recovery` grava `pending` e `sent` no `email_send_log`

### Welcome
- novo usuário não recebe 2 emails de boas-vindas
- `welcome-email` dispara no máximo 1 vez por `userId`
- não aparecem novos erros de unique constraint para o mesmo `message_id` em cenário normal
- chamadas concorrentes são absorvidas como duplicadas sem reenvio real

## Resultado esperado
Depois da correção:
- o signup continua funcionando
- o recovery continua funcionando
- o welcome deixa de duplicar
- a idempotência passa a ser consistente tanto no frontend quanto no backend
- os logs deixam de registrar erro falso-positivo por corrida de envio
