

# Migrar catalogo do arquivo estatico para o banco de dados

## Contexto
Os produtos agora vivem na tabela `products` do banco. O arquivo `src/data/products.ts` contem 17 produtos mock que estao duplicados. Todas as paginas ainda importam dados e funcoes desse arquivo estatico. E necessario migrar todas as referencias para buscar do banco e limpar o arquivo.

## Arquivos afetados (9 arquivos)

### 1. Refatorar `src/data/products.ts`
- Remover todo o array `products` e a funcao `getProduct()`
- Manter apenas as interfaces (`Product`, `ProductColor`, `ProductSpec`) adaptadas ao schema do banco
- Manter a funcao `formatPrice()`
- Criar um tipo `DbProduct` centralizado baseado na tabela (ou reusar o que ja existe em Admin.tsx)

### 2. Criar hook `src/hooks/useProducts.ts`
- Hook `useProducts()` que busca todos os produtos ativos do banco (`active = true`)
- Hook `useProduct(slug)` que busca um produto por slug
- Retorna `{ products, loading, error }`
- Usa `supabase.from("products").select("*")`

### 3. Atualizar `src/pages/Catalog.tsx`
- Substituir import estatico por `useProducts()`
- Adicionar estado de loading
- Adaptar o grid para usar dados do banco (slug como id, price_cents em vez de price)

### 4. Atualizar `src/pages/Landing.tsx`
- Substituir `products.slice(0, 4)` por `useProducts()` limitando a 4
- Adicionar loading state na secao de destaques

### 5. Atualizar `src/pages/Product.tsx`
- Substituir `getProduct(id)` por `useProduct(slug)` buscando do banco
- Adaptar para o formato do banco (price_cents, slug, etc.)

### 6. Atualizar `src/pages/Customize.tsx`
- Substituir `getProduct(id)` por `useProduct(slug)` do banco
- Usar o `id` do banco (UUID) para o checkout em vez do slug

### 7. Atualizar `src/pages/Orders.tsx`
- Substituir `getProduct(order.product_id)` por um join ou lookup no banco
- Buscar nome do produto via query separada ou join na query de orders

### 8. Atualizar `src/components/SeoHead.tsx`
- Receber produtos como prop ou usar `useProducts()`
- Adaptar campos (price_cents -> price em reais, slug como id)

### 9. Atualizar componentes de apresentacao
- `ProductCard.tsx`: adaptar interface para usar dados do banco (slug para link, price_cents / 100 para preco)
- `ProductInfo.tsx`: adaptar para price_cents e slug
- `ProductDetails.tsx`: adaptar specs do formato JSONB

## Secao tecnica

### Mapeamento de campos
```text
Arquivo estatico    ->  Banco de dados
product.id          ->  product.slug (para URLs)
product.price       ->  product.price_cents / 100
product.rating      ->  product.rating
product.reviewCount ->  product.review_count
product.images      ->  product.images
product.colors      ->  product.colors (JSONB)
product.specs       ->  product.specs (JSONB)
```

### Fluxo de dados
```text
Antes:  Componente -> import { products } from "@/data/products"
Depois: Componente -> useProducts() -> supabase.from("products").select("*")
```

Nenhuma alteracao no banco de dados e necessaria -- apenas codigo frontend.

