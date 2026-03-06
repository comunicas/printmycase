

## Plano: Ativar créditos para usuários existentes

### Estado Atual
- 2 usuários cadastrados (Rafael Bruno e rafacbruno)
- Ambos já possuem `referral_code` gerado
- Nenhum possui bônus de cadastro (0 moedas)
- Triggers continuam ausentes no banco

### Ações

**1. Creditar 50 moedas (signup_bonus) para cada usuário existente**
- INSERT em `coin_transactions` com `type = 'signup_bonus'`, validade 30 dias, para ambos os user IDs

**2. Recriar os 3 triggers no banco (migração)**
- `trigger_referral_code` BEFORE INSERT ON `profiles`
- `trigger_signup_bonus` AFTER INSERT ON `profiles`
- `trigger_referral_bonus` AFTER INSERT ON `referrals`

Isso garante que os usuários atuais recebam suas moedas e que novos cadastros funcionem automaticamente.

