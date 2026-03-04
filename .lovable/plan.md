

# Code Review e Refatoração — Emails + Pedidos

## Problemas Encontrados

### 1. `notify-order-status` — Bugs e Riscos

- **Email API incorreta**: Usa `fetch("https://api.lovable.dev/api/v1/email/send")` diretamente, mas deveria usar `sendLovableEmail` de `@lovable.dev/email-js` com `sender_domain` e `from`, igual ao `auth-email-hook`. A API raw pode não funcionar sem os campos obrigatórios (`from`, `sender_domain`).
- **Logo como texto, não imagem**: O template HTML usa `<span>ArtisCase</span>` em vez da imagem do logo que já está no bucket `email-assets`. Os templates de auth usam a imagem — inconsistência visual.
- **Sem validação de autenticação**: `verify_jwt = false` mas não verifica se quem chama é admin. Qualquer pessoa pode invocar a função e disparar emails. Precisa checar `has_role(uid, 'admin')`.
- **CORS headers incompletos**: Faltam headers como `x-supabase-client-platform` que o SDK envia.
- **`handleSaveTracking` não notifica**: Quando o admin salva tracking code e o status muda para `shipped`, não chama `notify-order-status`. O usuário não recebe o email com o rastreio.

### 2. `Admin.tsx` — Problemas de UX/Lógica

- **Duplicação de resolução de produto**: A lógica de buscar produto por slug/UUID está duplicada em `Admin.tsx`, `Orders.tsx` e `CheckoutSuccess.tsx`. Deveria ser um helper reutilizável.
- **`handleSaveTracking` sobrescreve sem confirmar**: Muda status para `shipped` direto sem enviar notificação.

### 3. `Orders.tsx` — Realtime incompleto

- **Realtime não filtra por `user_id`**: O channel escuta TODAS as atualizações da tabela `orders`, não apenas as do usuário atual. Embora RLS proteja os dados no SELECT inicial, o realtime payload pode conter dados de outros usuários (o filtro deveria ser server-side com `filter`).
- **`product_name`/`product_image` perdidos no update**: Quando o realtime atualiza um pedido, o spread `{ ...o, ...payload.new }` sobrescreve os campos enriquecidos (`product_name`, `product_image`) pois eles não existem no payload do banco.

### 4. Templates de Auth — Menores

- Templates estão corretos e consistentes. Sem problemas funcionais.

---

## Plano de Refatoração

### A. Criar helper `resolveProductInfo` (novo arquivo `src/lib/products.ts`)

Função reutilizável que recebe uma lista de `product_id`s e retorna um `Map<string, { name, image }>`. Remover duplicação de `Admin.tsx`, `Orders.tsx` e `CheckoutSuccess.tsx`.

### B. Refatorar `notify-order-status/index.ts`

1. Usar `sendLovableEmail` de `@lovable.dev/email-js` com `sender_domain: "notify.studio.artiscase.com"` e `from: "ArtisCase <noreply@notify.studio.artiscase.com>"`
2. Substituir o `<span>ArtisCase</span>` pelo `<img>` do logo no bucket `email-assets`
3. Adicionar validação: verificar JWT do chamador e confirmar que é admin via `has_role`
4. Corrigir CORS headers (adicionar headers do SDK)

### C. Corrigir `Admin.tsx`

1. Em `handleSaveTracking`, após salvar tracking + status `shipped`, chamar `notify-order-status` para que o email inclua o código de rastreio
2. Usar o helper `resolveProductInfo`

### D. Corrigir `Orders.tsx` realtime

1. Adicionar `filter: "user_id=eq.{userId}"` no channel subscription para receber apenas updates do próprio usuário
2. Preservar `product_name` e `product_image` no merge do payload realtime (não sobrescrever campos enriquecidos)
3. Usar o helper `resolveProductInfo`

### E. Simplificar `CheckoutSuccess.tsx`

1. Usar o helper `resolveProductInfo`

---

## Arquivos afetados

- `src/lib/products.ts` — novo helper
- `supabase/functions/notify-order-status/index.ts` — refatoração completa
- `src/pages/Admin.tsx` — tracking notification + usar helper
- `src/pages/Orders.tsx` — fix realtime + usar helper
- `src/pages/CheckoutSuccess.tsx` — usar helper

