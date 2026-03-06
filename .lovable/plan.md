

## Checklist — Sistema de Gamificação (Estado Atual)

### Banco de Dados — Implementado
- [x] Tabela `coin_transactions` com colunas corretas (id, user_id, amount, type, expires_at, description)
- [x] Tabela `referrals` (referrer_id, referred_id unique)
- [x] Coluna `referral_code` na tabela `profiles`
- [x] Função `get_coin_balance(_user_id)` — Security Definer, soma moedas válidas
- [x] Função `generate_referral_code()` — gera código de 6 caracteres
- [x] Trigger `handle_referral_code` — auto-gera código no insert de profile
- [x] Trigger `handle_signup_bonus` — credita 50 moedas (30 dias)
- [x] Trigger `handle_referral_bonus` — credita 50 moedas ao referrer
- [x] Referral processado no `handle_new_user` (lê `referral_code` do metadata)
- [x] RLS: users SELECT own, admins ALL em `coin_transactions`
- [x] RLS: users SELECT own referrals, INSERT com referred_id = auth.uid()

### ⚠️ Problema detectado: Triggers não existem no banco
- [ ] **Os triggers `handle_signup_bonus`, `handle_referral_bonus` e `handle_referral_code` NÃO estão ativos no banco** (a seção `<db-triggers>` mostra "There are no triggers in the database"). As funções existem, mas os triggers que as invocam não foram criados ou foram perdidos. Isso significa que **nenhum bônus automático está funcionando**.

### Edge Functions — Implementado
- [x] `create-coin-checkout` — cria sessão Stripe para pacotes de moedas (100/500/1500/5000)
- [x] `apply-ai-filter` — verifica saldo (10 moedas), debita após sucesso
- [x] `stripe-webhook` — credita moedas compradas (365 dias) e bônus de compra (100 moedas, 30 dias)

### ⚠️ Problema: `create-coin-checkout` não registrado no config.toml
- [ ] Falta entrada `[functions.create-coin-checkout]` com `verify_jwt = false` no `supabase/config.toml`

### Frontend — Implementado
- [x] Hook `useCoins` (balance + transactions)
- [x] Componente `CoinBalance` no header
- [x] Página `/coins` (saldo, referral link, loja de pacotes, histórico)
- [x] Rota `/coins` com `AuthGuard` em `App.tsx`
- [x] Referral link na página de perfil (Profile.tsx)
- [x] Signup captura `?ref=` e envia no metadata
- [x] Customize.tsx verifica erro 402 e redireciona para `/coins`
- [x] Admin tab "Moedas" com CoinsManager (filtros, ajuste manual, histórico)

---

## Próximos Passos Necessários

### 1. Recriar triggers no banco de dados (CRÍTICO)
Os 3 triggers precisam ser criados via migração:
- `trigger_signup_bonus` → AFTER INSERT ON `profiles` → chama `handle_signup_bonus()`
- `trigger_referral_bonus` → AFTER INSERT ON `referrals` → chama `handle_referral_bonus()`
- `trigger_referral_code` → BEFORE INSERT ON `profiles` → chama `handle_referral_code()`

Sem esses triggers, cadastro não dá moedas, referrals não funcionam, e códigos não são gerados.

### 2. Registrar `create-coin-checkout` no config.toml
Adicionar `[functions.create-coin-checkout]` com `verify_jwt = false` para que a função seja deployada corretamente.

### 3. Gerar referral codes para usuários existentes
Usuários criados antes da migração não têm `referral_code`. Executar UPDATE para popular esses registros.

### 4. Mostrar preço em reais nos pacotes de moedas
A página `/coins` mostra apenas a quantidade de moedas, sem o preço (R$ 9,90 / R$ 39,90 / R$ 99,90 / R$ 249,90). Adicionar valores visíveis.

### 5. (Opcional) Indicador de custo no botão de filtro IA
Exibir "🪙 10" nos botões de filtro na página de customização para que o usuário saiba o custo antes de clicar.

