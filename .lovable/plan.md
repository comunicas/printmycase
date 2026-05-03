## Problema

A página `/customize` (Selecionar modelo) e o seletor de modelo dentro do editor mostram "Nenhum modelo encontrado" porque a query `GET public_products` retorna array vazio para usuários anônimos.

A view `public_products` é `security_invoker=true` — herda o RLS de `products`. Hoje `products` só tem políticas para `authenticated` + `has_role(admin)`. Não há política pública. Logo, anon → 0 linhas.

Confirmado no banco:
- `public_products` view contém `WHERE active = true` ✓
- `products` tem 73 linhas ativas ✓
- Políticas em `products`: apenas 4, todas `{authenticated}` + `has_role admin` ✗

## Correção

Migração SQL adicionando política pública de leitura para produtos ativos:

```sql
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (active = true);
```

Isto:
- Mantém a política de admin para ver inativos (já existe e continua valendo via OR de policies do mesmo comando).
- Restaura o catálogo na home, em `/customize`, no `ModelSelector` e em todas as páginas SEO (`BrandPage`, `BrandModelPage`, etc.) que dependem da mesma view.
- Não expõe nenhum dado novo: a view já filtra `active=true` e os mesmos campos já eram públicos antes da regressão.

## Verificação pós-deploy

1. Recarregar `/customize` em aba anônima → grid com 73 modelos.
2. `/customize/iphone-16-pro-max` → seletor de modelo lista todas as marcas.
3. Home → carrosséis e bestsellers voltam a renderizar.

Nenhuma alteração de código frontend é necessária — é exclusivamente uma migração de banco.