

## Corrigir políticas RLS: `coin_transactions` e `referrals`

As políticas admin dessas duas tabelas usam `Roles: {public}` quando deveriam usar `{authenticated}`, já que verificam `auth.uid()`.

### Migração SQL

```sql
-- coin_transactions: recriar política admin com role authenticated
DROP POLICY "Admins can manage all coin transactions" ON public.coin_transactions;
CREATE POLICY "Admins can manage all coin transactions"
  ON public.coin_transactions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- referrals: recriar política admin com role authenticated
DROP POLICY "Admins can manage all referrals" ON public.referrals;
CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

Nenhuma alteração de código frontend necessária.

