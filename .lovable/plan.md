
## Implementar 3 ações prioritárias de SEO em Designs

### 1. `supabase/functions/sitemap/index.ts` — lastmod em designs
- Adicionar `updated_at` no select de `collection_designs` (já tem `created_at`)
- Usar `updated_at ?? created_at ?? today` como `lastmod` no `urlEntry` da linha de designs

### 2. `supabase/functions/prerender/index.ts` — description real
- No branch `/colecao/:colSlug/:designSlug`, ampliar o select para incluir `description`
- Usar `data.description ?? fallback genérico atual` no campo description do html()

### 3. `src/pages/DesignPage.tsx` — ViewContent + Clarity
- Importar `pixelEvent` + `generateEventId` de `@/lib/meta-pixel` e `clarityEvent` de `@/lib/clarity`
- Adicionar `useEffect` que dispara, quando o design carrega:
  - `clarityEvent("design_view")`
  - `pixelEvent("ViewContent", { content_name, content_ids: [design.id], content_type: "product", value: price/100, currency: "BRL" }, eventId)`
- Deps: `[design?.id]` para disparar 1x por design

### Sem alterações de schema. Sem novas dependências.
