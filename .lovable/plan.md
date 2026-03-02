

# Sincronizar produtos com o Stripe e atualizar checkout

## Resumo
Criar uma funcao backend para sincronizar em massa todos os 73 produtos com o Stripe, e atualizar o fluxo de checkout para usar os precos reais de cada produto em vez de um valor fixo hardcoded.

## Problemas atuais
1. Os 73 produtos no banco nao possuem `stripe_product_id` nem `stripe_price_id`
2. A funcao `create-checkout` usa um preco fixo hardcoded de R$ 69,90 (`PRICE_CENTS = 6990`) e cria `price_data` inline em vez de usar um Price ID do Stripe
3. O nome do produto no checkout mostra o UUID em vez do nome real

## O que sera feito

### 1. Criar edge function `bulk-sync-stripe`
- Nova funcao em `supabase/functions/bulk-sync-stripe/index.ts`
- Restrita a admins (mesma verificacao de role usada em `admin-sync-stripe`)
- Busca todos os produtos que nao possuem `stripe_product_id`
- Para cada um, cria o Product e o Price no Stripe via API REST
- Atualiza o banco com os IDs retornados
- Retorna um relatorio com quantos foram sincronizados

### 2. Atualizar `create-checkout` para usar precos do banco
- Buscar o produto do banco pelo `product_id` recebido
- Usar `product.price_cents` em vez do valor fixo
- Usar `product.name` no nome do checkout
- Se o produto tiver `stripe_price_id`, usar `price` em vez de `price_data` (melhor rastreabilidade no Stripe)
- Se nao tiver, manter fallback com `price_data` inline

### 3. Adicionar botao "Sincronizar todos com Stripe" no painel admin
- Botao na pagina `/admin` que chama a funcao `bulk-sync-stripe`
- Mostra progresso/resultado da sincronizacao
- Permite ao admin sincronizar novos produtos adicionados futuramente

### 4. Registrar funcao no config.toml
- Adicionar `[functions.bulk-sync-stripe]` com `verify_jwt = false`

## Secao tecnica

### Fluxo da sincronizacao em massa
```text
Admin clica "Sincronizar" 
  -> bulk-sync-stripe (edge function)
  -> SELECT * FROM products WHERE stripe_product_id IS NULL
  -> Para cada produto:
     -> POST /v1/products (Stripe API)
     -> POST /v1/prices (Stripe API)
     -> UPDATE products SET stripe_product_id, stripe_price_id
  -> Retorna { synced: N, errors: [] }
```

### Checkout atualizado
```text
Antes:  price_data com PRICE_CENTS = 6990 fixo
Depois: Busca produto do banco -> usa price_cents real + stripe_price_id quando disponivel
```

### Arquivos afetados
- **Criar**: `supabase/functions/bulk-sync-stripe/index.ts`
- **Editar**: `supabase/functions/create-checkout/index.ts`
- **Editar**: `supabase/config.toml` (adicionar funcao)
- **Editar**: `src/pages/Admin.tsx` (botao de sync em massa)
