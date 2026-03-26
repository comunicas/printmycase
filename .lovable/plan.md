

## Revisao Completa dos Modelos fal.ai — Parametros e Implementacao

### Modelos na lista (MODEL_OPTIONS)

| # | Modelo | URL | Existe no fal.ai? | Handler dedicado? |
|---|--------|-----|--------------------|--------------------|
| 1 | Flux Dev (padrao) | `fal-ai/flux/dev/image-to-image` | Sim | Sim (bloco `else` default) |
| 2 | Flux Pro Kontext | `fal-ai/flux-pro/kontext` | Sim | Sim (`isKontext`) |
| 3 | SD 3.5 Large | `fal-ai/stable-diffusion-v35-large/image-to-image` | Sim | **NAO — cai no default Flux Dev** |
| 4 | Style Transfer | `fal-ai/image-apps-v2/style-transfer` | Sim | Sim (`isStyleTransfer`) |
| 5 | Photography Effects | `fal-ai/image-apps-v2/photography-effects` | Sim | Sim (`isPhotographyEffects`) |
| 6 | Lighting Restoration | `fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration` | Sim | Sim (`isLightingRestoration`) |

### Problema encontrado

**SD 3.5 Large** nao tem handler proprio e cai no bloco default (Flux Dev). Os defaults sao diferentes:

| Parametro | Flux Dev (default atual) | SD 3.5 Large (API) |
|-----------|--------------------------|---------------------|
| `strength` | 0.85 | **0.83** |
| `num_inference_steps` | 40 | **28** |
| `guidance_scale` | 3.5 | 3.5 |
| `image_size` | nao suportado | **suportado** (portrait_16_9) |
| `negative_prompt` | nao suportado | **suportado** |

Usar steps=40 no SD 3.5 Large gasta mais tempo sem ganho de qualidade (o recomendado e 28). O strength 0.85 vs 0.83 e marginal.

### Verificacao dos demais modelos

- **Flux Dev**: `strength: 0.85`, `steps: 40`, `guidance: 3.5` — correto (defaults da API sao 0.95/40/3.5, o 0.85 e intencional para preservar mais a imagem original)
- **Kontext**: `image_url`, `prompt`, `aspect_ratio: "9:16"`, `output_format: "jpeg"` — correto
- **Style Transfer**: `image_url`, `target_style`, `style_reference_image_url` (condicional), `aspect_ratio: { ratio: "9:16" }` — correto
- **Photography Effects**: `image_url`, `effect_type`, `aspect_ratio: { ratio: "9:16" }` — correto
- **Lighting Restoration**: `image_urls: [url]`, `image_size: { width: 720, height: 1280 }` — correto

### Correcao necessaria

**Arquivo: `supabase/functions/apply-ai-filter/index.ts`**

Adicionar handler dedicado para SD 3.5 Large antes do bloco `else` default:

```typescript
const isSD35 = modelUrl.includes("stable-diffusion-v35-large");

// ... nos ifs existentes, antes do else:
} else if (isSD35) {
  falBody = {
    image_url: inputImage,
    prompt: filter.prompt,
    strength: 0.83,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    image_size: "portrait_16_9",
    output_format: "jpeg",
  };
} else {
  // Flux Dev default
  ...
}
```

### Detalhes tecnicos
- 1 arquivo modificado: `supabase/functions/apply-ai-filter/index.ts`
- Adicionar deteccao `isSD35` e bloco de configuracao dedicado
- Nenhuma mudanca no frontend ou banco de dados

