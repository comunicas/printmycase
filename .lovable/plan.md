
Objetivo: revisar e estabilizar a estrutura de emails em etapas pequenas, isoladas e reversíveis, priorizando primeiro a ativação real do envio antes de expandir novos gatilhos.

1. Etapa 1 — Confirmar e destravar a base de envio
- Revisar o domínio de envio já configurado no projeto: `notify.printmycase.com.br`.
- O estado atual continua bloqueando o envio real: o domínio está com falha de provisionamento por timeout.
- Antes de qualquer mudança em templates ou novos fluxos, corrigir essa base no painel de emails do projeto e revalidar o domínio.
- Manter o subdomínio atual, sem trocar arquitetura nem provedor, para evitar introduzir nova variabilidade.

Resultado esperado
- O projeto volta a ter um domínio de envio operacional.
- A fila existente poderá entregar emails de fato, em vez de apenas enfileirar/logar eventos.

2. Etapa 2 — Auditar a infraestrutura já existente sem alterar comportamento
- Validar a coerência do pipeline já implementado:
  - hook de emails de autenticação
  - sender de emails da aplicação
  - processador de fila
  - unsubscribe
  - suppression
  - log de envio
- Conferir se os pontos críticos estão alinhados:
  - domínio de envio baked-in nas functions
  - fila `auth_emails` e `transactional_emails`
  - uso de `message_id` e idempotência
  - consistência entre templates registrados e templates realmente usados
- Corrigir apenas desvios estruturais detectados, sem adicionar novos fluxos ainda.

Resultado esperado
- Infraestrutura existente documentada e consistente.
- Risco reduzido de corrigir um problema e abrir outro em auth ou pedidos.

3. Etapa 3 — Corrigir a divergência de documentação
- Atualizar a documentação interna para refletir a arquitetura real de emails.
- Remover a referência incorreta a envio via Resend onde o projeto hoje usa a infraestrutura nativa já implementada.
- Documentar claramente:
  - quais emails já existem
  - quais funções participam do envio
  - quais lacunas ainda existem

Resultado esperado
- Fonte única de verdade para manutenção futura.
- Menor chance de regressão por decisões baseadas em documentação desatualizada.

4. Etapa 4 — Validar os fluxos já existentes, um por vez
- Testar primeiro apenas os emails de autenticação.
- Depois testar apenas o fluxo de atualização de status de pedido.
- Em cada fluxo, validar:
  - geração do evento
  - entrada no log
  - passagem pela fila
  - envio final
  - comportamento em suppression/unsubscribe quando aplicável
- Não introduzir novos templates nem novos triggers antes de confirmar que os fluxos atuais estão saudáveis.

Resultado esperado
- Saber exatamente o que já funciona e o que ainda falha.
- Evitar misturar correção estrutural com expansão funcional.

5. Etapa 5 — Fechar a lacuna do formulário de contato
- Só após estabilizar o envio base, integrar a página `/contato` ao sistema de emails.
- Implementar em duas partes:
  - email de confirmação para quem enviou a mensagem
  - email interno de notificação para atendimento
- Preservar o fluxo atual de gravação em `contact_messages` e o honeypot existente.
- Fazer essa integração de forma idempotente para evitar duplicidade em reenvios/retries.

Resultado esperado
- O contato deixa de ser apenas persistência no banco e passa a ter retorno operacional real.
- Atendimento recebe aviso sem depender apenas do painel admin.

6. Etapa 6 — Adicionar templates novos de forma mínima
- Criar somente os templates estritamente necessários para o contato:
  - confirmação de recebimento
  - notificação interna
- Seguir o estilo visual já usado no email de status de pedido e nos templates de auth.
- Não expandir para emails promocionais nem automações extras nesta fase.

Resultado esperado
- Incremento pequeno, seguro e fácil de validar.
- Padronização visual entre emails já existentes e novos.

7. Etapa 7 — Observabilidade e checagens finais
- Verificar os registros em `email_send_log` com foco em:
  - pendentes que nunca avançam
  - falhas recorrentes
  - suppressions inesperadas
  - duplicidades por `message_id`
- Confirmar o comportamento de ponta a ponta nos cenários principais:
  - auth
  - atualização de status
  - contato
  - unsubscribe
- Se necessário, só então propor melhorias secundárias, como dashboard de acompanhamento ou novos triggers.

Resultado esperado
- Estrutura estabilizada com trilha de auditoria clara.
- Base pronta para futuras automações com baixo risco.

Análise revisada do estado atual
- A arquitetura principal de emails já existe e é madura o suficiente para reaproveitamento.
- O bloqueio mais importante não está no frontend nem nos templates: está na ativação real do domínio de envio.
- Auth emails já usam fila.
- App emails já têm sender genérico e ao menos um template ativo (`order-status-update`).
- O formulário `/contato` ainda não está conectado ao envio de email; hoje ele apenas grava na tabela `contact_messages`.
- A documentação interna ainda mistura a arquitetura atual com uma referência antiga/incompatível.

Sequência recomendada de implementação segura
1. Regularizar domínio de envio
2. Auditar infraestrutura existente
3. Corrigir documentação
4. Validar auth
5. Validar status de pedido
6. Integrar contato
7. Validar logs e retry/suppression

Detalhes técnicos
- Arquivos principais a revisar/ajustar:
  - `supabase/functions/auth-email-hook/index.ts`
  - `supabase/functions/send-transactional-email/index.ts`
  - `supabase/functions/process-email-queue/index.ts`
  - `supabase/functions/handle-email-unsubscribe/index.ts`
  - `supabase/functions/handle-email-suppression/index.ts`
  - `supabase/functions/notify-order-status/index.ts`
  - `supabase/functions/_shared/transactional-email-templates/registry.ts`
  - `src/pages/Contact.tsx`
  - `src/components/admin/ContactMessagesManager.tsx`
  - `ARCHITECTURE.md`
- Tabelas já existentes relevantes:
  - `email_send_log`
  - `email_send_state`
  - `email_unsubscribe_tokens`
  - `suppressed_emails`
  - `contact_messages`
- Estado do domínio no momento da revisão:
  - `notify.printmycase.com.br` com falha de provisionamento por timeout
- Risco principal a evitar:
  - adicionar novos fluxos antes de resolver a camada base de entrega
