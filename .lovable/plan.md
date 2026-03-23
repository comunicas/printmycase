

## Ajustar filtros IA para 9:16 em alta resolução + corrigir modelos

### Análise dos logs e modelos

**Modelos em uso e suporte a 9:16:**

| Modelo | Suporte 9:16 | Status |
|--------|-------------|--------|
| `fal-ai/image-apps-v2/style-transfer` | `aspect_ratio: { ratio: "9:16" }` → 4K | OK |
| `fal-ai/image-apps-v2/photography-effects` | `aspect_ratio: { ratio: "9:16" }` → 4K | OK |
| `fal-ai/flux-pro/kontext` | `aspect_ratio: "9:16"` (string direto) | Precisa fix — está caindo no else genérico com params inválidos (`strength`, `num_inference_steps`, `image_size`) |

**Problema encontrado**: O modelo `kontext` cai no branch `else` do edge function e recebe params que não aceita (`strength`, `num_inference_steps`, `image_size`). Funciona por acaso porque fal.ai ignora params extras, mas `image_size` pode conflitar com `aspect_ratio`.

**Filtro "Cartoon"** usa `target_style: "cartoon_animation"` que não existe no enum do style-transfer. Valores válidos incluem `cartoon_3d`, `hand_drawn_animation`, `claymation`, `anime_character` etc. — precisa corrigir para um valor válido.

### Alterações

**1. `supabase/functions/apply-ai-filter/index.ts`** — Adicionar branch para `kontext`

```
const isKontext = modelUrl.includes("kontext");

if (isKontext) {
  falBody = {
    image_url: imageBase64,
    prompt: filter.prompt,
    aspect_ratio: "9:16",
    output_format: "jpeg",
  };
}
```

Garantir que todos os branches enviam 9:16:
- `style-transfer`: já tem `aspect_ratio: { ratio: "9:16" }` ✓
- `photography-effects`: já tem `aspect_ratio: { ratio: "9:16" }` ✓
- `kontext`: novo branch com `aspect_ratio: "9:16"` ✓
- `else` (fallback genérico): manter `image_size: { width: 720, height: 1280 }` + `aspect_ratio: "9:16"` para modelos flux genéricos

**2. Corrigir filtro "Cartoon"** — UPDATE no banco
- Mudar `prompt` de `cartoon_animation` para `claymation` (valor válido mais próximo do conceito "cartoon")

**3. Adicionar novos estilos disponíveis** como opção

Estilos do `style-transfer` que ainda não são filtros e podem ser adicionados:
- `dark_academia`, `y2k`, `vaporwave`, `synthwave`, `outrun`, `concept_art`, `hyperrealistic`, `digital_art`

Efeitos do `photography-effects` disponíveis:
- `vintage_film`, `portrait_photography`, `fashion_photography`, `street_photography`, `sepia_tone`, `light_leaks`, `vignette_effect`, `instant_camera`, `golden_hour`, `dramatic_lighting`, `soft_focus`, `bokeh_effect`

Vou adicionar alguns dos mais populares como filtros inativos para o admin ativar depois.

### Arquivos/ações afetados

| Ação | Detalhe |
|------|---------|
| `supabase/functions/apply-ai-filter/index.ts` | Branch `kontext` dedicado com params corretos |
| UPDATE `ai_filters` (Cartoon) | Corrigir `prompt` para `claymation` |
| INSERT `ai_filters` | Novos filtros inativos: `dark_academia`, `vaporwave`, `synthwave`, `golden_hour`, `bokeh_effect`, `dramatic_lighting` |

