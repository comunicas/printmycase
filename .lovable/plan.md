

# Emails da plataforma: autenticação + notificação de status de pedido

## Visão Geral

O plano cobre dois tipos de email:
1. **Emails de autenticação** (confirmação de conta, recuperação de senha, magic link) — usando o sistema gerenciado de templates do Lovable
2. **Emails transacionais de status de pedido** — edge function customizada que envia email quando o admin muda o status

Todos os emails seguirão a identidade visual da ArtisCase: cor primária roxa `hsl(265, 83%, 57%)`, fonte Inter, logo da marca, e linguagem em português brasileiro casual.

---

## Pré-requisito: domínio de email

Para que os emails venham de um domínio próprio (ex: `contato@artiscase.com.br`), é necessário configurar um domínio de email primeiro. Sem isso, os emails de autenticação usam o remetente padrão do Lovable.

Antes de implementar, vou abrir o diálogo de configuração de domínio de email para que você possa configurar o DNS.

---

## Parte 1 — Emails de autenticação (templates branded)

### Ação
- Executar `scaffold_auth_email_templates` para gerar os 6 templates padrão
- Customizar cada template com a identidade visual da ArtisCase:
  - **Cores**: botão principal `hsl(265, 83%, 57%)` com texto branco, fundo do body `#ffffff`
  - **Logo**: upload do `src/assets/logo-artiscase.png` para storage e inclusão no topo de cada template
  - **Fonte**: Inter (com fallback Arial, sans-serif)
  - **Tom**: português BR casual, consistente com a UI ("Olá!", "Bem-vindo à ArtisCase")
  - **Border-radius**: `1.5rem` nos botões (matching `--radius`)
- Deploy da edge function `auth-email-hook`

### Templates customizados
| Template | Assunto | Conteúdo principal |
|---|---|---|
| signup | Confirme sua conta ArtisCase | "Olá! Clique no botão abaixo para confirmar seu email e começar a personalizar sua capa." |
| recovery | Redefinir senha | "Recebemos um pedido para redefinir sua senha. Clique abaixo para criar uma nova." |
| magic-link | Acesse sua conta | "Clique no botão para entrar na sua conta ArtisCase." |
| invite | Convite ArtisCase | "Você foi convidado para a ArtisCase." |
| email-change | Confirme a troca de email | "Confirme seu novo endereço de email." |
| reauthentication | Código de verificação | "Seu código de verificação é: {token}" |

---

## Parte 2 — Notificação por email ao mudar status do pedido

### Edge function: `notify-order-status`

Nova edge function que recebe `{ order_id, new_status }`, busca o pedido e o perfil do usuário no banco, e envia um email transacional usando a API de email do Lovable (`@lovable.dev/email-js`).

**Fluxo:**
1. Admin muda status no painel → `handleStatusChange` em `Admin.tsx` chama `supabase.functions.invoke("notify-order-status")` após o UPDATE com sucesso
2. A edge function:
   - Busca o pedido (product_id, total_cents, tracking_code)
   - Busca o perfil do usuário (full_name) e email via `auth.admin.getUserById`
   - Resolve o nome do produto
   - Renderiza um email HTML com template branded e envia

**Template do email de status:**
- Logo ArtisCase no topo
- Saudação: "Olá, {nome}!"
- Mensagem: "Seu pedido #{id_curto} teve uma atualização de status."
- Badge visual com o novo status
- Quando `shipped`: inclui código de rastreio e link dos Correios
- Botão "Ver Meus Pedidos" apontando para a URL da app
- Rodapé: "ArtisCase — Capas personalizadas"

### Mudança em `src/pages/Admin.tsx`
- Em `handleStatusChange`, após o UPDATE com sucesso, invocar `supabase.functions.invoke("notify-order-status", { body: { order_id, new_status } })`

### Config
- Adicionar `[functions.notify-order-status]` com `verify_jwt = false` no config.toml (validação manual no código)

---

## Arquivos afetados

- `supabase/functions/_shared/email-templates/` — 6 templates de auth (gerados + customizados)
- `supabase/functions/auth-email-hook/index.ts` — gerado pelo scaffold
- `supabase/functions/notify-order-status/index.ts` — novo
- `supabase/config.toml` — nova entrada
- `src/pages/Admin.tsx` — invocar edge function ao mudar status

