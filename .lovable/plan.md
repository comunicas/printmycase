

## Problema

Dois triggers duplicados (`trg_signup_bonus` e `trigger_signup_bonus`) estão registrados na tabela `profiles`, ambos chamando `handle_signup_bonus()`. Isso faz com que cada novo usuario receba o dobro do bonus de cadastro (2x 50 = 100 moedas).

Isso foi causado por migrations diferentes que criaram triggers com nomes distintos para a mesma funcao, sem remover o anterior.

## Solucao

Uma unica migration SQL para dropar o trigger duplicado:

```sql
DROP TRIGGER IF EXISTS trigger_signup_bonus ON public.profiles;
```

Manter apenas `trg_signup_bonus`. Nenhuma alteracao de codigo necessaria.

## Impacto

- Novos usuarios passarao a receber exatamente 50 moedas (o valor configurado em `coin_settings`)
- Usuarios existentes que ja receberam 100 nao serao afetados (nao e necessario corrigir retroativamente, a menos que desejado)

