

## Auditoria dos Parâmetros das APIs fal.ai

### Resultados da Análise

Analisei as 3 edge functions (`generate-gallery-image`, `apply-ai-filter`, `upscale-image`) comparando os parâmetros enviados com a documentação oficial da fal.ai.

---

### 1. `upscale-image` — aura-sr

| Parâmetro enviado | Valor | API espera | Status |
|---|---|---|---|
| `image_url` | URL | `image_url` (string, required) | OK |
| `upscaling_factor` | `2` | `upscale_factor` (integer, default 4) | **ERRO: nome errado** |
| `overlapping_tiles` | `true` | `overlapping_tiles` (boolean) | OK |

**Problema encontrado**: O código envia `upscaling_factor: 2` mas a API espera `upscale_factor` (sem "ing"). A API provavelmente ignora o parâmetro incorreto e usa o default `4`, fazendo upscale 4x ao invés de 2x — gerando imagens maiores que o necessário e gastando mais tempo.

**Correção**: Renomear `upscaling_factor` para `upscale_factor` na linha 91.

---

### 2. `apply-ai-filter` — Múltiplos modelos

#### Style Transfer (`fal-ai/image-apps-v2/style-transfer`)
| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_url` | URL | required | OK |
| `target_style` | `filter.prompt` | enum (impressionist, anime, etc.) | OK |
| `style_reference_image_url` | URL (condicional) | optional | OK |
| `aspect_ratio` | `{ ratio: "9:16" }` | `{ ratio: RatioEnum }` | OK |

#### Photography Effects (`fal-ai/image-apps-v2/photography-effects`)
| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_url` | URL | required | OK |
| `effect_type` | `filter.prompt` | enum (film, vintage_film, etc.) | OK |
| `aspect_ratio` | `{ ratio: "9:16" }` | `{ ratio: RatioEnum }` | OK |

#### Lighting Restoration (`qwen-image-edit-plus-lora-gallery/lighting-restoration`)
| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_urls` | `[inputImage]` | list (required) | OK |
| `image_size` | `{ width: 720, height: 1280 }` | ImageSize object | OK |

#### Kontext (`flux-kontext`)
| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_url` | URL | required | OK |
| `prompt` | string | required | OK |
| `aspect_ratio` | `"9:16"` | string enum | OK |
| `output_format` | `"jpeg"` | enum | OK |

#### Default (flux/dev/image-to-image)
| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_url` | URL | required | OK |
| `prompt` | string | required | OK |
| `strength` | `0.75` | float | OK |
| `num_inference_steps` | `28` | integer | OK |
| `guidance_scale` | `7.5` | float | OK |
| `image_size` | `{ width: 720, height: 1280 }` | object | OK |
| `aspect_ratio` | `"9:16"` | string | **NOTA**: flux/dev/image-to-image não aceita `aspect_ratio`, só `image_size`. Parâmetro ignorado (sem erro, apenas redundante). |

---

### 3. `generate-gallery-image` — flux-2-pro/edit

| Parâmetro | Valor | API | Status |
|---|---|---|---|
| `image_urls` | array de URLs | list (required) | OK |
| `prompt` | string | required | OK |
| `seed` | number (opcional) | integer | OK |
| `image_size` | enum string | ImageSize ou Enum | OK |
| `safety_tolerance` | number | string enum ("1"-"6") | **POSSIVEL PROBLEMA**: API espera string, código envia number |
| `output_format` | "png"/"jpeg" | enum | OK |

**Nota sobre `safety_tolerance`**: A API documenta como string enum (`"2"`), mas na prática a fal.ai aceita números também. Funciona, mas não é ideal.

---

### Resumo de Correções Necessárias

| Arquivo | Problema | Impacto | Correção |
|---|---|---|---|
| `upscale-image/index.ts` | `upscaling_factor` deveria ser `upscale_factor` | Upscale 4x em vez de 2x (mais lento, imagens desnecessariamente grandes) | Renomear parâmetro |
| `generate-gallery-image/index.ts` | `safety_tolerance` enviado como number | Funciona mas não segue spec | Converter para string |
| `apply-ai-filter/index.ts` (default path) | `aspect_ratio` redundante com `image_size` | Ignorado pela API, sem impacto | Remover parâmetro redundante |

### Implementação

**1. `supabase/functions/upscale-image/index.ts`** (linha 91)
- Renomear `upscaling_factor: 2` para `upscale_factor: 2`

**2. `supabase/functions/generate-gallery-image/index.ts`** (linha 77)
- Converter `safety_tolerance` para string: `falBody.safety_tolerance = String(Number(safety_tolerance))`

**3. `supabase/functions/apply-ai-filter/index.ts`** (linha 140)
- Remover `aspect_ratio: "9:16"` do bloco default (flux/dev/image-to-image) pois esse modelo não suporta o parâmetro

### Detalhes técnicos
- 3 arquivos de edge functions modificados
- Nenhuma mudança no frontend ou banco de dados
- A correção do `upscale_factor` é a mais impactante — atualmente o upscale está gerando imagens 4x ao invés de 2x

