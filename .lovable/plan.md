

## Adicionar evento `product_viewed` com tag do slug na Product.tsx

### Alteração em `src/pages/Product.tsx`

Dentro do `useEffect` que já existe para SEO (que depende de `product`), adicionar após a injeção de meta tags:

```ts
import { clarityEvent, clarityTag } from "@/lib/clarity";
```

No `useEffect` existente (ou num segundo `useEffect` dedicado), quando `product` estiver disponível:

```ts
clarityEvent("product_viewed");
clarityTag("product_viewed", product.slug);
```

### Arquivo alterado
- `src/pages/Product.tsx` — import do clarity + disparo de evento e tag quando o produto carrega

