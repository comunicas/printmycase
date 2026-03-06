

## Plano: Expandir controles Style Transfer + adicionar Photography Effects

### Dados da API

**Style Transfer** (`fal-ai/image-apps-v2/style-transfer`):
- `target_style` enum: `anime_character, cartoon_3d, hand_drawn_animation, cyberpunk_future, anime_game_style, comic_book_animation, animated_series, cartoon_animation, lofi_aesthetic, cottagecore, dark_academia, y2k, vaporwave, liminal_space, weirdcore, dreamcore, synthwave, outrun, photorealistic, hyperrealistic, digital_art, concept_art, impressionist, anime, pixel_art, claymation`
- `style_reference_image_url` (opcional)
- `aspect_ratio` com `ratio` enum

**Photography Effects** (`fal-ai/image-apps-v2/photography-effects`):
- `effect_type` enum: `film, vintage_film, portrait_photography, fashion_photography, street_photography, sepia_tone, film_grain, light_leaks, vignette_effect, instant_camera, golden_hour, dramatic_lighting, soft_focus, bokeh_effect, high_contrast, double_exposure`
- `aspect_ratio` com `ratio` enum

### Alterações

#### 1. Admin UI (`AiFiltersManager.tsx`)
- Adicionar `fal-ai/image-apps-v2/photography-effects` ao `MODEL_OPTIONS` com label "Photography Effects"
- Expandir `STYLE_OPTIONS` com os estilos faltantes do Style Transfer: `liminal_space, weirdcore, dreamcore, synthwave, outrun, photorealistic, hyperrealistic, digital_art, concept_art, anime, pixel_art, claymation`
- Criar `EFFECT_OPTIONS` com os 16 efeitos de fotografia
- No dialog, quando o modelo for `photography-effects`, mostrar dropdown de `effect_type` (salvo no campo `prompt`)
- Lógica condicional: Style Transfer mostra estilos, Photography Effects mostra efeitos, outros modelos mostram textarea de prompt

#### 2. Edge Function (`apply-ai-filter/index.ts`)
- Detectar modelo `photography-effects` via `modelUrl.includes("photography-effects")`
- Construir body com `{ image_url, effect_type: filter.prompt, aspect_ratio: { ratio: "9:16" } }`
- Manter lógica existente para style-transfer e outros modelos

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/AiFiltersManager.tsx` | Novo modelo, estilos expandidos, dropdown de efeitos fotográficos |
| `supabase/functions/apply-ai-filter/index.ts` | Suporte ao body de photography-effects |

