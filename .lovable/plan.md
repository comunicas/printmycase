

## Plano: Adicionar modelo Style Transfer do Fal.ai

O modelo `fal-ai/image-apps-v2/style-transfer` tem uma API diferente dos modelos image-to-image. Em vez de receber `prompt` + `strength`, ele recebe `target_style` (um enum com estilos pré-definidos como "impressionist", "anime_character", "cyberpunk_future", etc.). Isso exige adaptações em três pontos.

### 1. Admin UI — Novo modelo + campo de estilo

Em `AiFiltersManager.tsx`:
- Adicionar `"fal-ai/image-apps-v2/style-transfer"` ao `MODEL_OPTIONS` com label "Style Transfer"
- Quando esse modelo for selecionado, trocar o campo "Prompt" por um select de estilos pré-definidos:
  - impressionist, anime_character, cartoon_3d, hand_drawn_animation, cyberpunk_future, anime_game_style, comic_book_animation, animated_series, cartoon_animation, lofi_aesthetic, cottagecore, dark_academia, y2k, vaporwave
- O valor selecionado será salvo na coluna `prompt` (reaproveitando a coluna existente)

### 2. Edge Function — Lógica condicional por modelo

Em `apply-ai-filter/index.ts`:
- Detectar se `model_url` contém `style-transfer`
- Se sim, enviar body com `{ image_url, target_style: filter.prompt }` em vez do body padrão com `prompt`, `strength`, etc.
- Caso contrário, manter o body atual para modelos image-to-image

### 3. Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/AiFiltersManager.tsx` | Novo modelo + select condicional de estilos |
| `supabase/functions/apply-ai-filter/index.ts` | Body condicional por tipo de modelo |

Nenhuma migration necessária — o campo `prompt` armazena o estilo selecionado.

