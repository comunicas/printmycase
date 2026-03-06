

## Plano: Imagens AI em 9:16 fullscreen

### Problema
O modelo Style Transfer (`fal-ai/image-apps-v2/style-transfer`) não recebe parâmetros de tamanho no body atual, então retorna a imagem no tamanho/aspecto padrão — que não preenche o preview do celular (9:16).

Para o modelo image-to-image padrão, o tamanho está fixo em `512x1024` (1:2), que também não é exatamente 9:16.

### Solução

Em `supabase/functions/apply-ai-filter/index.ts`:

1. **Style Transfer**: adicionar `image_size: { width: 720, height: 1280 }` ao body — 720×1280 é exatamente 9:16 e oferece boa qualidade sem ser pesado demais

2. **Image-to-image padrão**: alterar de `512x1024` para `720x1280` (9:16)

```typescript
const falBody = isStyleTransfer
  ? { 
      image_url: imageBase64, 
      target_style: filter.prompt,
      image_size: { width: 720, height: 1280 }
    }
  : {
      image_url: imageBase64,
      prompt: filter.prompt,
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 7.5,
      image_size: { width: 720, height: 1280 },
    };
```

### Arquivo alterado
| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/apply-ai-filter/index.ts` | Adicionar `image_size: 720x1280` em ambos os bodies |

