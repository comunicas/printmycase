

## Plano: Corrigir registros de coin_settings faltantes no banco

### Problema
O banco de dados contém apenas **1 registro** na tabela `coin_settings` (`ai_generation_cost = 5`). Todos os outros settings (signup_bonus, referral_bonus, purchase_bonus, ai_filter_cost, ai_upscale_cost) foram perdidos. Os triggers e edge functions usam fallbacks hardcoded, mas o admin não consegue gerenciar os valores.

### Valores a inserir (conforme imagem de referência)

| key | value | descrição |
|-----|-------|-----------|
| signup_bonus_amount | 50 | Moedas no bônus de cadastro |
| signup_bonus_days | 30 | Validade bônus cadastro (dias) |
| referral_bonus_amount | 20 | Moedas no bônus de indicação |
| referral_bonus_days | 30 | Validade bônus indicação (dias) |
| purchase_bonus_amount | 15 | Moedas no bônus de compra |
| purchase_bonus_days | 30 | Validade bônus compra (dias) |
| ai_filter_cost | 20 | Custo filtro IA |
| ai_upscale_cost | 20 | Custo upscale IA |

### Alterações

#### 1. Migration SQL
INSERT com `ON CONFLICT (key) DO NOTHING` para os 8 registros acima, preservando o `ai_generation_cost` que já existe.

#### 2. Nenhuma alteração de código
O `CoinsManager.tsx` já tem todos os labels corretos e a lógica de agrupamento (Bônus vs Custos IA). Com os registros no banco, a UI mostrará tudo corretamente.

### Verificação
- Triggers `handle_signup_bonus` e `handle_referral_bonus` já leem de `coin_settings` com COALESCE fallback — continuam funcionando
- Edge function `stripe-webhook` lê `purchase_bonus_amount`/`purchase_bonus_days` — OK
- Edge functions `apply-ai-filter` e `upscale-image` leem `ai_filter_cost` e `ai_upscale_cost` — OK

| Arquivo | Alteração |
|---------|-----------|
| Banco de dados | INSERT 8 registros em coin_settings |

