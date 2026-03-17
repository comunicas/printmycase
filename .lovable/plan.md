

## Correção retroativa de bônus duplicados

### Problema
Usuários cadastrados enquanto os dois triggers estavam ativos receberam 2x `signup_bonus` de 50 moedas cada (total 100). Precisamos remover uma das transações duplicadas para cada usuário afetado.

### Solução

Uma única query SQL via insert tool (operação de dados, não schema):

```sql
DELETE FROM coin_transactions
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, type ORDER BY created_at) AS rn
    FROM coin_transactions
    WHERE type = 'signup_bonus'
  ) sub
  WHERE rn > 1
);
```

**Lógica**: Para cada `user_id` com tipo `signup_bonus`, mantém apenas a primeira transação (ordenada por `created_at`) e remove as duplicatas.

### Impacto
- Usuários afetados terão saldo reduzido em 50 moedas
- Nenhuma alteração de código necessária
- Operação irreversível — os registros duplicados serão apagados

