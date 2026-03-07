

## Configuração de valores de moedas pelo admin

Atualmente, todos os valores de ganho e consumo de moedas estão **hardcoded** em vários pontos do código:

| Valor | Onde está | Quantidade |
|-------|-----------|------------|
| Bônus cadastro | Trigger SQL `handle_signup_bonus` | 50 moedas, 30 dias |
| Bônus indicação | Trigger SQL `handle_referral_bonus` | 50 moedas, 30 dias |
| Bônus compra case | `stripe-webhook/index.ts` | 100 moedas, 30 dias |
| Custo filtro IA | `apply-ai-filter/index.ts` + `FilterConfirmDialog.tsx` | 10 moedas |

Para torná-los editáveis pelo admin, o plano é:

### 1. Criar tabela `coin_settings` no banco

Uma tabela simples chave-valor para armazenar cada configuração:

```
coin_settings (
  key text PRIMARY KEY,     -- ex: "signup_bonus_amount"
  value integer NOT NULL,
  description text
)
```

Chaves iniciais:
- `signup_bonus_amount` → 50
- `signup_bonus_days` → 30
- `referral_bonus_amount` → 50
- `referral_bonus_days` → 30
- `purchase_bonus_amount` → 100
- `purchase_bonus_days` → 30
- `ai_filter_cost` → 10

RLS: leitura pública (authenticated), escrita apenas admin.

### 2. Atualizar triggers SQL

Alterar `handle_signup_bonus` e `handle_referral_bonus` para ler os valores de `coin_settings` em vez de usar constantes.

### 3. Atualizar edge functions

- `apply-ai-filter/index.ts` → ler `ai_filter_cost` da tabela
- `stripe-webhook/index.ts` → ler `purchase_bonus_amount` e `purchase_bonus_days` da tabela

### 4. Atualizar frontend

- `FilterConfirmDialog.tsx` → buscar custo do filtro via query à `coin_settings`
- `AiFiltersList.tsx` → exibir custo dinâmico

### 5. Criar UI admin para editar valores

Adicionar uma seção no `CoinsManager.tsx` (ou novo componente) com campos editáveis para cada configuração, permitindo ao admin alterar os valores diretamente.

### Resumo de arquivos alterados

- **Migração SQL**: criar tabela, seed, atualizar triggers
- `supabase/functions/apply-ai-filter/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `src/components/customize/FilterConfirmDialog.tsx`
- `src/components/customize/AiFiltersList.tsx`
- `src/components/admin/CoinsManager.tsx` (nova seção de configurações)

