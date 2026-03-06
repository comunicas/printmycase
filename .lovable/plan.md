

## Plano: Modelo Fal.ai configurável por filtro (Opção B)

Três alterações coordenadas:

### 1. Migration — Adicionar coluna `model_url` à tabela `ai_filters`

```sql
ALTER TABLE public.ai_filters 
ADD COLUMN model_url text NOT NULL DEFAULT 'fal-ai/flux/dev/image-to-image';
```

### 2. Admin UI — Campo "Modelo" no `AiFiltersManager.tsx`

- Adicionar `model_url` à interface `AiFilter` e aos estados do dialog
- No dialog de criação/edição, adicionar um campo select com opções pré-definidas dos modelos mais comuns do Fal.ai:
  - `fal-ai/flux/dev/image-to-image` (Flux Dev — padrão)
  - `fal-ai/flux-pro/v1.1/image-to-image` (Flux Pro)
  - `fal-ai/stable-diffusion-v35-large/image-to-image` (SD 3.5 Large)
- Incluir `model_url` no `handleSave` (insert e update)
- Exibir o modelo selecionado na listagem (texto pequeno abaixo do prompt)

### 3. Edge Function — Usar `model_url` dinâmico

Em `apply-ai-filter/index.ts`:
- Alterar o select para buscar `prompt, model_url`
- Trocar a URL fixa `https://fal.run/fal-ai/flux/dev/image-to-image` por `https://fal.run/${filter.model_url}`

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| Migration SQL | `ALTER TABLE` — nova coluna |
| `src/components/admin/AiFiltersManager.tsx` | Campo select de modelo no dialog |
| `supabase/functions/apply-ai-filter/index.ts` | URL dinâmica via `filter.model_url` |

