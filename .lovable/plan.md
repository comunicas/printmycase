

## Customização aberta sem login — login exigido para ações pagas

### Conceito
Remover o `AuthGuard` da rota `/customize/:id` para permitir uso anônimo da ferramenta (upload, zoom, rotação, expandir). Login será exigido apenas ao tentar usar filtros IA, upscale IA ou prosseguir para checkout.

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | Remover `<AuthGuard>` da rota `/customize/:id` |
| `src/hooks/useCustomize.tsx` | Adicionar helper `requireAuth()` que verifica `user` e, se ausente, redireciona para login com `redirect` de volta. Usar antes de: `handleFilterClick`, `handleUpscaleClick`, `handleContinue` |
| `src/hooks/useCustomize.tsx` | No draft restore, manter restauração de sessionStorage para anônimos; pular fetch de `pending_checkouts` se `!user` (já existe o guard na linha 105) |
| `src/hooks/useCoins.ts` | Garantir que retorna `balance: 0` e `loading: false` quando `!user` (sem erro) |

### Helper `requireAuth`
```typescript
const requireAuth = useCallback(() => {
  if (user) return true;
  const redirectPath = `/customize/${product?.slug || id}`;
  navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  return false;
}, [user, product?.slug, id, navigate]);
```

Será chamado no início de `handleFilterClick`, `handleUpscaleClick` e `handleContinue` — se retornar `false`, a ação é interrompida.

### O que funciona sem login
- Visualizar produto, upload de imagem, zoom, rotação, expandir, arrastar
- Ver lista de filtros (mas não aplicar)
- Salvar rascunho em sessionStorage

### O que exige login
- Aplicar filtro IA (🪙 pago)
- Upscale IA (🪙 pago)
- Prosseguir para checkout

