
Objetivo: configurar o remetente final do Resend como `PrintMyCase <noreply@printmycase.com.br>` e validar o envio em produção para os dois fluxos ativos: autenticação e emails transacionais.

## Diagnóstico atual
- O helper compartilhado já suporta configuração por secrets:
  - `RESEND_FROM_EMAIL`
  - `RESEND_FROM_NAME`
- O fallback atual ainda é:
  - email: `onboarding@resend.dev`
  - nome: `PrintMyCase`
- Os fluxos ativos já usam esse helper central:
  - `auth-email-hook`
  - `send-transactional-email`
- Os logs mais recentes mostram o problema real em produção:
  - erro `403 validation_error`
  - motivo: o Resend ainda está em modo de teste e só permite envio para `suporte@printmycase.com.br`
  - isso confirma que o remetente final ainda não foi aplicado com um domínio verificado

## Estado atual do checklist
### Já está pronto
- [x] Integração com Resend via connector existe
- [x] O projeto já lê `RESEND_FROM_EMAIL` e `RESEND_FROM_NAME`
- [x] Auth e transacional compartilham o mesmo remetente padrão
- [x] O domínio informado para uso final é `printmycase.com.br`
- [x] O endereço desejado foi definido como `noreply@printmycase.com.br`

### O que está faltando
- [ ] Definir as duas secrets no backend:
  - `RESEND_FROM_EMAIL=noreply@printmycase.com.br`
  - `RESEND_FROM_NAME=PrintMyCase`
- [ ] Redeployar as funções de email para garantir que a configuração ativa use o novo remetente
- [ ] Validar um envio transacional em produção
- [ ] Validar um envio de auth em produção
- [ ] Confirmar nos logs que o erro 403 desapareceu

## Melhor caminho
### Etapa 1 — Configurar o remetente final
Atualizar as secrets de runtime para:
- `RESEND_FROM_EMAIL = noreply@printmycase.com.br`
- `RESEND_FROM_NAME = PrintMyCase`

Resultado esperado:
- todo envio que hoje cai no fallback `onboarding@resend.dev` passa a sair com o remetente final da marca

### Etapa 2 — Garantir coerência entre código e runtime
Depois de definir as secrets:
- redeployar pelo menos estas funções:
  - `auth-email-hook`
  - `send-transactional-email`
  - `submit-contact`
  - `notify-order-status`

Resultado esperado:
- produção passa a usar a configuração nova de forma consistente

### Etapa 3 — Validar transacional em produção
Executar uma validação real com um dos fluxos transacionais já existentes:
- recomendado:
  - fluxo de contato, porque é simples e controlado
- opcional complementar:
  - atualização de status de pedido

Critérios de sucesso:
- a função responde sem erro
- não aparece mais `403 validation_error`
- o `email_send_log` registra `pending` e depois `sent`
- o metadado `provider_message_id` é preenchido quando retornado pelo Resend

### Etapa 4 — Validar auth em produção
Executar um teste real de autenticação:
- cadastro novo com confirmação de email, ou
- recuperação de senha

Critérios de sucesso:
- `auth-email-hook` executa sem erro
- o email chega com remetente `PrintMyCase <noreply@printmycase.com.br>`
- o log do envio aparece corretamente
- não há fallback para `onboarding@resend.dev`

### Etapa 5 — Fechar observabilidade
Após os testes:
- revisar logs das funções:
  - `auth-email-hook`
  - `send-transactional-email`
- revisar entradas recentes no `email_send_log`
- confirmar que os dois fluxos estão saindo pelo mesmo remetente final

Resultado esperado:
- migração do remetente concluída e validada com evidência operacional

## Comentários importantes
- O domínio `printmycase.com.br` precisa estar realmente verificado no Resend para permitir envios a terceiros.
- O log atual indica que a conta ainda está operando como sandbox/teste para envios externos.
- Como o código já está preparado para ler as secrets, o trabalho principal agora é configuração + deploy + teste real.
- Não vejo necessidade de refatorar código adicional para essa etapa, a menos que a validação revele novo erro após sair do remetente de teste.

## Arquivos e áreas impactadas
- `supabase/functions/_shared/resend.ts`
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/submit-contact/index.ts`
- `supabase/functions/notify-order-status/index.ts`

## Critério de conclusão
A etapa estará finalizada quando estes pontos forem verdadeiros:
- [ ] Remetente ativo = `PrintMyCase <noreply@printmycase.com.br>`
- [ ] Auth email enviado com sucesso em produção
- [ ] Email transacional enviado com sucesso em produção
- [ ] Nenhum erro 403 de sandbox/teste nos logs recentes
- [ ] Logs e rastreabilidade confirmados para ambos os fluxos

## Detalhes técnicos
- O helper central já aplica:
  - `from = \`${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>\``
- Hoje os defaults são:
  - `onboarding@resend.dev`
  - `PrintMyCase`
- O erro visto em produção foi:
  - `You can only send testing emails to your own email address`
- Isso indica que o bloqueio atual é de remetente/domínio efetivo no Resend, não de template ou de lógica de envio.
