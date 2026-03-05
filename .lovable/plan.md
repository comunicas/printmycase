

## Code Review Completo — Aplicação ArtisCase

Revisão de 100% dos arquivos: 14 páginas, 20+ componentes, 5 hooks, 6 libs, 7 edge functions.

---

### Bugs e Problemas Críticos

- [ ] **`Catalog.tsx` — `useProducts()` sem argumento carrega 0 produtos**: Na linha 14, `useProducts()` é chamado sem argumento. No hook, `limit === undefined` causa `setLoading(false)` e retorna array vazio (linhas 14-16 do hook). Deveria ser `useProducts(100)` ou similar para carregar todos os produtos.

- [ ] **`Admin.tsx` — casting `as any` nos produtos**: Linha 63 faz `setProducts((data as any[]) ?? [])` ao invés de usar `mapRow()` do `useProducts.ts`. Os dados brutos do Supabase são setados diretamente sem mapeamento, o que pode causar inconsistências de tipo (ex: `rating` como string ao invés de number).

- [ ] **`FaqManager.tsx` — mesmos castings `as any`**: Linhas 44, 72, 83, 99, 126, 127 usam `as any` desnecessariamente em operações do Supabase. Os tipos gerados já cobrem essas tabelas.

- [ ] **`create-checkout` — campo legado `image_url`**: Linha 39 desestrutura `image_url` que não é mais enviado pelo frontend (que envia `original_image_url` e `edited_image_url`). Campo legado que deveria ser removido da desestruturação.

- [ ] **`Orders.tsx` — `statusFlow` não inclui `paid`**: O fluxo visual de status (linhas 23-30) pula de `pending` direto para `analyzing`, mas `constants.ts` define o status `paid`. Se um pedido estiver em `paid`, o stepper visual ficará incorreto.

- [ ] **`notify-order-status` — `getClaims()` pode não existir**: Linha 129 usa `supabaseUser.auth.getClaims(token)` que não é um método padrão do SDK `@supabase/supabase-js`. Deveria usar `getUser(token)` como as outras edge functions.

- [ ] **`statusColors` não usado no frontend**: Exportado em `constants.ts` (linhas 12-21) mas nunca importado em nenhum componente. Código morto.

---

### Qualidade de Código

- [ ] **`Admin.tsx` é monolítico (410 linhas)**: Contém toda a lógica de pedidos inline (status, tracking, filtros). Extrair para `OrdersManager.tsx` seguindo o padrão de `FaqManager` e `ModelRequestsManager`.

- [ ] **`formatPrice` duplicado**: `ProductsTable.tsx` (linha 16-17) e `BulkPriceDialog.tsx` (linhas 8-9) redefinem `formatCents`/`fmt` localmente. Já existe `formatPrice` em `lib/types.ts`. Unificar.

- [ ] **`statusLabels` duplicado**: Definido em `constants.ts` (frontend) e repetido em `notify-order-status/index.ts` (edge function, linhas 13-22). Não pode ser compartilhado (Deno vs Vite), mas deveria ter um comentário de sincronização.

- [ ] **Google SVG icon duplicado**: O ícone SVG do Google (paths d="M22.56...") está duplicado em `Login.tsx` (linhas 55-59) e `Signup.tsx` (linhas 81-85). Extrair para um componente `GoogleIcon`.

- [ ] **`addresses` tipado como `any[]`**: `AddressForm.tsx` linha 45 usa `useState<any[]>([])`. As addresses têm schema definido no Supabase — usar o tipo gerado.

- [ ] **`Profile.tsx` — anti-pattern de state sync**: Linhas 34-39 usam `if (profile && profile.id !== lastProfileId)` dentro do render body para sincronizar estado. Deveria usar `useEffect` com `profile` como dependência.

---

### Performance

- [ ] **`Orders.tsx` — fetch sem `user_id` filter**: Linha 45-48 busca `select("*")` de orders sem filtrar por `user_id`. O RLS provavelmente filtra, mas a query deveria ser explícita com `.eq("user_id", user.id)` para clareza e para evitar pegar a query limit de 1000 sem necessidade.

- [ ] **`CheckoutSuccess.tsx` — fetch sem guard de autenticação**: A página não está protegida por `AuthGuard` (ver `App.tsx` linha 38). Qualquer pessoa com o `session_id` pode ver dados do pedido. Considerar adicionar proteção.

- [ ] **`resolveProductInfo` — queries potencialmente redundantes**: Quando todos os IDs são UUIDs, a query de slugs ainda é executada (retorna vazio). Micro-otimização, mas o pattern `Promise.resolve({ data: [] as any[] })` inclui casting desnecessário.

---

### Segurança

- [ ] **`create-checkout` — lookup de produto por ID sem validar `active`**: Linha 53-58 busca produto por `id` sem verificar se está ativo (`active = true`). Usuários poderiam fazer checkout de produtos desativados.

- [ ] **`stripe-webhook` — timing-safe comparison ausente**: A verificação de assinatura Stripe (linha 51) usa `===` para comparar hashes. Deveria usar comparação timing-safe para prevenir timing attacks.

---

### Legados e Código Morto

- [ ] **`statusColors` (frontend)**: Exportado em `constants.ts` mas nunca usado. Remover.

- [ ] **`image_url` em `create-checkout`**: Campo legado na desestruturação (linha 39) e no fallback (linha 179). Remover referências.

- [ ] **`scale-in` animation**: Usado em `CheckoutSuccess.tsx` (linha 62) como `animate-scale-in` mas não definido no `tailwind.config.ts`. Verificar se funciona ou adicionar keyframe.

---

### Acessibilidade

- [ ] **Formulários sem `autocomplete`**: Campos de email, senha, nome e telefone em Login, Signup, Profile e AddressForm não têm atributos `autocomplete`. Adicionar `autocomplete="email"`, `autocomplete="new-password"`, `autocomplete="name"`, etc.

- [ ] **`select` nativo sem label acessível**: Admin orders (linha 363) e bulk price (linha 243) usam `<select>` nativo sem `<label>` ou `aria-label`.

- [ ] **Links de rastreio sem contexto**: O link "Rastreio: {code}" em `Orders.tsx` (linhas 215-221) aponta para a página genérica dos Correios sem incluir o código na URL.

---

### Resumo por Prioridade

| Prioridade | Item | Arquivos |
|---|---|---|
| **Crítico** | Fix `useProducts()` sem argumento no Catalog | `Catalog.tsx`, `useProducts.ts` |
| **Crítico** | Fix `getClaims()` inexistente no notify-order-status | `notify-order-status/index.ts` |
| **Crítico** | Validar produto ativo no create-checkout | `create-checkout/index.ts` |
| **Alto** | Extrair OrdersManager do Admin | `Admin.tsx` → novo `OrdersManager.tsx` |
| **Alto** | Remover castings `as any` (Admin, FaqManager) | `Admin.tsx`, `FaqManager.tsx`, `AddressForm.tsx` |
| **Médio** | Extrair GoogleIcon, unificar formatPrice | `Login.tsx`, `Signup.tsx`, `ProductsTable.tsx`, `BulkPriceDialog.tsx` |
| **Médio** | Remover código morto (statusColors, image_url) | `constants.ts`, `create-checkout/index.ts` |
| **Baixo** | Autocomplete nos formulários | `Login.tsx`, `Signup.tsx`, `Profile.tsx`, `AddressForm.tsx` |
| **Baixo** | aria-label em selects nativos | `Admin.tsx` |

