

## Ajuste do botão download mobile + otimização de timeout fal.ai

### 1. Botão download no mobile — evitar quebra de texto

**`src/components/customize/ContinueBar.tsx`**

O botão "Baixar imagem" no mobile pode quebrar em telas pequenas. Correções:
- Adicionar `whitespace-nowrap` ao botão de download
- No mobile, usar texto abreviado "Baixar" em vez de "Baixar imagem" (via classes responsive ou simplificação)
- Alternativamente: manter "Baixar imagem" com `text-sm` e `whitespace-nowrap` para garantir que caiba

### 2. Timeout da chamada fal.ai — análise dos logs

**Situação atual**: As chamadas `supabase.functions.invoke()` não têm timeout configurado. O Supabase Edge Functions tem um timeout padrão de ~60s. Os logs mostram que o style-transfer leva ~30s (boot em 1774233383s, response em 1774233414s = ~31s). Isso está dentro do limite.

**Não há timeout explícito para ajustar** no fetch do fal.ai dentro da edge function — o Deno runtime controla isso. O que podemos fazer:
- A edge function não tem `AbortController` — adicionar um com timeout de 55s para evitar que a function fique presa caso fal.ai demore mais que o limite do runtime
- No frontend, o `supabase.functions.invoke()` não suporta timeout nativo, mas podemos usar `Promise.race` com um timeout de 58s para dar feedback ao usuário

**Alterações**:

**`supabase/functions/apply-ai-filter/index.ts`** — Adicionar `AbortController` com 50s de timeout na chamada ao fal.ai para fail-fast antes do limite do runtime (60s)

**`supabase/functions/upscale-image/index.ts`** — Mesmo padrão de AbortController com 50s

**`src/hooks/useCustomize.tsx`** — Sem alteração (o timeout do runtime já cuida disso; adicionar no frontend seria redundante)

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/components/customize/ContinueBar.tsx` | `whitespace-nowrap` + `text-sm` no botão download mobile |
| `supabase/functions/apply-ai-filter/index.ts` | AbortController 50s no fetch fal.ai |
| `supabase/functions/upscale-image/index.ts` | AbortController 50s no fetch fal.ai |

