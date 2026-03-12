

## Refatoração Frontend — AI Generations

### Problemas identificados

1. **`fetchImages` closure bug** (`AiGenerationsManager.tsx:30-53`): `loading` está no array de deps do `useCallback` e é checado com `if (loading) return`. Quando `loading` muda, `fetchImages` recria → observer reconecta → loop potencial. Solução: usar `useRef` para `loading` em vez de estado no guard.

2. **Cast inválido de products** (`AiGenerationsManager.tsx:128`): `as Tables<"products">[]` mas o select é parcial (`id, name, slug, images`). Deve usar um tipo local com apenas os campos selecionados.

3. **Edge function cleanup silencioso** (`generate-gallery-image/index.ts:147`): `.catch(() => {})` no `remove()` não funciona — o SDK Supabase retorna `{ data, error }`, não rejeita. O delete falha silenciosamente sem log. Deve usar `await` e checar `error`.

4. **Prompt em `Input` single-line** (`AiImageGenerator.tsx:276`): prompts são longos (100+ chars). Deveria ser `textarea` para melhor UX.

5. **`useCustomize.ts` barrel desnecessário** (`src/hooks/useCustomize.ts`): arquivo que apenas re-exporta `useCustomize.tsx`. Legado redundante.

### Plano

| Arquivo | Alteração |
|---|---|
| `src/components/admin/AiGenerationsManager.tsx` | Usar `loadingRef` para guard no `fetchImages`; remover `loading` dos deps do `useCallback`; criar tipo `ProductOption` com campos parciais em vez do cast |
| `src/components/admin/AiImageGenerator.tsx` | Trocar `Input` do prompt por `textarea` estilizado |
| `supabase/functions/generate-gallery-image/index.ts` | Corrigir cleanup: `await` o `remove()` e logar erro se houver |
| `src/hooks/useCustomize.ts` | Remover barrel; atualizar imports que referenciam `.ts` para `.tsx` |

### Detalhes

**fetchImages refactor:**
- `const loadingRef = useRef(false)` — guard usa ref, `loading` state fica só para UI
- `fetchImages` não terá `loading` nos deps → referência estável → observer não reconecta desnecessariamente

**ProductOption type:**
```typescript
type ProductOption = Pick<Tables<"products">, "id" | "name" | "slug" | "images">;
```

**Textarea do prompt:**
- `<textarea>` com classes Tailwind equivalentes ao Input, `rows={3}`, resize vertical

