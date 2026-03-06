

## Plano: Sistema de Gamificação com Moedas Virtuais

### Visão Geral

Sistema de moedas virtuais (coins) que incentiva cadastro, referral, compras e uso de IA. Administradores gerenciam a economia interna.

---

### 1. Banco de Dados (Migrações)

**Tabela `coin_transactions`** — registro de todas as movimentações:
- `id`, `user_id`, `amount` (positivo = crédito, negativo = débito), `type` (enum: `signup_bonus`, `referral_bonus`, `purchase_bonus`, `coin_purchase`, `ai_usage`, `admin_adjustment`), `expires_at`, `created_at`, `description`

**Tabela `referrals`** — rastreio de convites:
- `id`, `referrer_id`, `referred_id` (unique), `created_at`

**Coluna `referral_code`** na tabela `profiles`:
- Código único gerado no signup (ex: 6 caracteres alfanuméricos)

**Função `get_coin_balance(uuid)`** — Security Definer:
- Soma `amount` de `coin_transactions` onde `expires_at > now()` para o user_id
- Retorna inteiro

**RLS em `coin_transactions`**:
- Users: SELECT own rows
- Admins: ALL

**RLS em `referrals`**:
- Users: SELECT own (referrer_id = auth.uid())
- INSERT: referrer_id = auth.uid()
- Admins: SELECT ALL

---

### 2. Fluxos de Crédito Automático

**Signup (50 moedas, 30 dias)**:
- Trigger `after insert on profiles` → insere em `coin_transactions` com `type = 'signup_bonus'`, `expires_at = now() + 30 days`

**Referral (50 moedas, 30 dias)**:
- No signup, se `referral_code` presente na URL, insere em `referrals` e credita 50 moedas ao referrer via trigger `after insert on referrals`

**Compra de case (100 moedas, 30 dias)**:
- No `stripe-webhook`, ao marcar pedido como `analyzing`, insere 100 moedas para o `user_id` do pedido

---

### 3. Compra de Moedas via Stripe

**Pacotes** (criar produtos/preços no Stripe):
- 100 moedas, 500 moedas, 1500 moedas, 5000 moedas

**Edge Function `create-coin-checkout`**:
- Recebe `package` (100/500/1500/5000)
- Cria sessão Stripe `mode: payment`
- Metadata: `user_id`, `coin_amount`

**Webhook** (extensão do existente):
- Novo evento: se metadata contém `coin_amount`, insere em `coin_transactions` com `type = 'coin_purchase'`, `expires_at = now() + 365 days`

---

### 4. Consumo de Moedas

**Edge Function `apply-ai-filter`** (modificação):
- Antes de processar, chamar `get_coin_balance` para verificar saldo
- Se saldo < custo (ex: 10 moedas), retornar erro 402
- Após sucesso, inserir transação negativa em `coin_transactions`

---

### 5. Frontend — Usuário

**Componente `CoinBalance`** (header):
- Exibe saldo atual com ícone de moeda
- Link para página de compra de moedas

**Página `/coins`** (nova):
- Saldo atual, histórico de transações, pacotes de compra
- Botões de compra redirecionam ao Stripe

**Referral**:
- Na página de perfil, mostrar código de convite + botão copiar link
- URL: `artiscase-v2.lovable.app/signup?ref=CODIGO`

**Customize page**:
- Mostrar saldo antes de aplicar filtro
- Se saldo insuficiente, mostrar modal com link para compra

---

### 6. Frontend — Admin

**Nova tab "Moedas" no painel admin**:
- Lista de usuários com saldo
- Histórico de transações (filtros por tipo)
- Ajuste manual: selecionar usuário, valor, descrição
- Configuração de preços dos pacotes (futuramente)

---

### Arquivos Criados/Editados

**Migrações SQL**: 1 migração com tabelas, enum, triggers, funções, RLS
**Edge Functions**: `create-coin-checkout` (nova), `apply-ai-filter` (editar), `stripe-webhook` (editar)
**Componentes**: `CoinBalance.tsx`, `CoinStore.tsx` (página), `admin/CoinsManager.tsx`
**Páginas**: `Coins.tsx`
**Edições**: `Signup.tsx` (referral code), `Profile.tsx` (link referral), `AppHeader.tsx` (coin balance), `Admin.tsx` (tab moedas), `App.tsx` (rota /coins), `Customize.tsx` (verificação saldo)
**Hooks**: `useCoins.ts` (saldo + histórico)

---

### Ordem de Implementação

1. Migração DB (tabelas, enum, triggers, funções, RLS)
2. Hook `useCoins` + componente `CoinBalance` no header
3. Trigger de signup bonus (automático via DB)
4. Sistema de referral (signup com `?ref=`, perfil com link)
5. Bonus por compra (webhook)
6. Consumo de moedas no filtro IA
7. Página de compra de moedas + edge function + webhook
8. Painel admin de moedas

