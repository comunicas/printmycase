## Problema

Na Home, a query `GET public_ai_generations` retorna `[]` para visitantes anônimos, mesmo com 28 gerações marcadas como `public=true` no banco.

Causa: a tabela `user_ai_generations` tem apenas uma policy RESTRICTIVA (`Restrict select to owner, admin or public`) e nenhuma policy PERMISSIVA para `anon`. No Postgres, RLS exige pelo menos uma PERMISSIVE que case — sem ela, a RESTRICTIVE não é suficiente e o resultado é zero linhas. A view `public_ai_generations` é `security_invoker`, então herda esse comportamento.

A regressão é gêmea da que afetou `products` — provavelmente do mesmo endurecimento recente de RLS.

## Correção

Adicionar uma policy PERMISSIVE de SELECT para `anon` e `authenticated` cobrindo apenas registros públicos. A RESTRICTIVE existente continua válida e mantém o convite a usuários autenticados verem somente o que é deles + público + admin.

```sql
CREATE POLICY "Anyone can view public generations"
ON public.user_ai_generations
FOR SELECT
TO anon, authenticated
USING (public = true);
```

Efeito: a vitrine de IA na Home volta a renderizar; o resto continua protegido (gerações privadas continuam só para o dono ou admin, garantido pela policy RESTRICTIVE).

## Verificação

1. Recarregar a Home em aba anônima → bloco de gerações IA com 8 imagens.
2. `GET /rest/v1/public_ai_generations` retorna lista não vazia.
3. Logado como usuário não-admin: não vê gerações de outros usuários (RESTRICTIVE garante).