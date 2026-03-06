

## Plano: Corrigir aspecto 9:16 nos filtros IA

### Problema
A API do Fal.ai para o modelo `style-transfer` **não aceita** o parâmetro `image_size`. Ela usa `aspect_ratio` com um objeto `{ ratio: "9:16" }`. O parâmetro `image_size` está sendo ignorado, e o modelo retorna a imagem no aspecto padrão (1:1 ou baseado na imagem original).

Para o modelo `fal-ai/image-editing/style-transfer`, o parâmetro correto é `aspect_ratio` com valores enum como `"9:16"`.

Para o modelo `fal-ai/image-apps-v2/style-transfer`, o parâmetro correto é `aspect_ratio: { ratio: "9:16" }`.

### Solução

Em `supabase/functions/apply-ai-filter/index.ts`, substituir `image_size` pelo formato correto de cada API:

```typescript
const falBody = isStyleTransfer
  ? { 
      image_url: imageBase64, 
      target_style: filter.prompt, 
      aspect_ratio: { ratio: "9:16" }
    }
  : {
      image_url: imageBase64,
      prompt: filter.prompt,
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 7.5,
      image_size: { width: 720, height: 1280 },
      aspect_ratio: "9:16",
    };
```

### Arquivo alterado
| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/apply-ai-filter/index.ts` | Trocar `image_size` por `aspect_ratio: { ratio: "9:16" }` no body do style-transfer; adicionar `aspect_ratio: "9:16"` no image-to-image |

