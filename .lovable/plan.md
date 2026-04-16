

## Corrigir trigger duplicado de bônus de indicação

### Problema
A tabela `referrals` possui **dois triggers** (`trg_referral_bonus` e `trigger_referral_bonus`) que executam a mesma função `handle_referral_bonus`. Resultado: cada indicação credita o bônus **em dobro**.

### Solução
1. **Migração SQL**: Remover o trigger duplicado `trigger_referral_bonus`, mantendo apenas `trg_referral_bonus`
2. **Corrigir dados**: Deletar uma das duas transações duplicadas de `referral_bonus` para o usuário afetado

### SQL

```sql
-- Remove duplicate trigger
DROP TRIGGER IF EXISTS trigger_referral_bonus ON public.referrals;

-- Remove one of the duplicate bonus transactions
DELETE FROM coin_transactions 
WHERE id = '9273d4b6-39de-4de5-9a52-df265d786292';
```

### Impacto
- Indicações futuras creditarão o bônus apenas uma vez
- O saldo do usuário será corrigido (remove 20 moedas duplicadas)

