

## Checklist — Sistema de Gamificação (Estado Atual)

### Banco de Dados — Implementado ✅
- [x] Tabela `coin_transactions` com colunas corretas
- [x] Tabela `referrals` (referrer_id, referred_id unique)
- [x] Coluna `referral_code` na tabela `profiles`
- [x] Função `get_coin_balance(_user_id)` — Security Definer
- [x] Função `generate_referral_code()` — gera código de 6 caracteres
- [x] Trigger `trigger_referral_code` — BEFORE INSERT ON profiles
- [x] Trigger `trigger_signup_bonus` — AFTER INSERT ON profiles
- [x] Trigger `trigger_referral_bonus` — AFTER INSERT ON referrals
- [x] Referral processado no `handle_new_user`
- [x] RLS configurado em coin_transactions e referrals
- [x] Referral codes gerados para usuários existentes

### Edge Functions — Implementado ✅
- [x] `create-coin-checkout` — registrado no config.toml
- [x] `apply-ai-filter` — verifica saldo (10 moedas), debita após sucesso
- [x] `stripe-webhook` — credita moedas compradas e bônus de compra

### Frontend — Implementado ✅
- [x] Hook `useCoins` (balance + transactions)
- [x] Componente `CoinBalance` no header
- [x] Página `/coins` com preços em R$ visíveis
- [x] Indicador 🪙 10 nos botões de filtro IA
- [x] Rota `/coins` com `AuthGuard`
- [x] Referral link na página de perfil
- [x] Signup captura `?ref=` e envia no metadata
- [x] Customize.tsx verifica erro 402
- [x] Admin tab "Moedas" com CoinsManager
