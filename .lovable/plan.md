

## Limitar posts exibidos na vitrine Instagram

### O que muda

**1 arquivo editado: `src/components/InstagramShowcase.tsx`**

Na query que busca os posts, adicionar `.limit(6)` para trazer no máximo 6 posts do banco. Isso garante que mesmo com muitos posts cadastrados no admin, a vitrine exibe apenas os 6 primeiros (ordenados por `sort_order`).

### Detalhe técnico

Linha da query atual:
```ts
.order("sort_order")
```

Passa a ser:
```ts
.order("sort_order")
.limit(6)
```

Sem outras alterações. O admin continua cadastrando quantos posts quiser — apenas a vitrine pública limita a exibição.

