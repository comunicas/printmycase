

## Fix: Open Redirect em Edge Functions de Checkout

### Problema
As funções `create-checkout` e `create-coin-checkout` usam `req.headers.get("origin")` para construir URLs de redirecionamento do Stripe. Um atacante pode forjar o header `Origin` e redirecionar o usuário para um site malicioso após o pagamento.

### Solução
Substituir o uso do header `Origin` por uma allowlist de domínios confiáveis. Se o origin não estiver na lista, usar o domínio de produção como fallback.

**Allowlist:**
- `https://studio.artiscase.com`
- `https://artiscase.com`
- URLs de preview do Lovable (`*.lovable.app`)

### Alterações

**1. `supabase/functions/create-checkout/index.ts`**
- Adicionar função `getSafeOrigin(req)` que valida o header Origin contra a allowlist
- Substituir `const origin = req.headers.get("origin") || ...` pela chamada segura
- Mantém fallback para `https://studio.artiscase.com`

**2. `supabase/functions/create-coin-checkout/index.ts`**
- Mesma função `getSafeOrigin(req)` 
- Substituir os dois usos inline de `req.headers.get("origin")` nas URLs success/cancel

Nenhum secret adicional necessário — a URL de produção será hardcoded no código.

