

## Corrigir cancel_url do Stripe para compras de coleção

### Problema
Na edge function `create-checkout`, a `cancel_url` do Stripe é sempre `/customize/{product.slug}`, mesmo para compras de coleção. Quando o usuário cancela o pagamento no Stripe, ele é redirecionado para a página de customização (que não faz sentido para coleções) em vez de voltar para a página do design (`/colecao/{collectionSlug}/{designSlug}`).

### Correção

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `create-checkout/index.ts` | Quando `isCollectionPurchase`, buscar o slug da coleção via join (`collections.slug`) na query do design. Montar `cancel_url` como `/colecao/{collection.slug}/{design.slug}` em vez de `/customize/{product.slug}` |

### Detalhes

Na query existente do design (linha ~107), adicionar join para pegar o slug da coleção:

```typescript
// Antes
.select("*")

// Depois  
.select("*, collections!inner(slug)")
```

Na montagem da cancel_url (linha ~219):

```typescript
// Antes
params.append("cancel_url", `${origin}/customize/${product.slug}`);

// Depois
const cancelUrl = isCollectionPurchase
  ? `${origin}/colecao/${design!.collections.slug}/${design!.slug}`
  : `${origin}/customize/${product.slug}`;
params.append("cancel_url", cancelUrl);
```

Sem mudança no frontend — a correção é inteiramente na edge function.

