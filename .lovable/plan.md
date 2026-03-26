

## Revisão dos Modelos Flux — Parâmetros de Edição de Imagem

### Modelos em uso

| Function | Modelo | Tipo | Edita imagem? |
|----------|--------|------|---------------|
| `generate-gallery-image` | `fal-ai/flux-2-pro/edit` | Multi-image editing | ✅ Sim |
| `apply-ai-filter` (default) | `fal-ai/flux/dev/image-to-image` | Single-image editing | ✅ Sim |

Ambos editam imagens. Estão corretos para seus respectivos usos.

---

### Problemas encontrados no `apply-ai-filter` (default path — `flux/dev/image-to-image`)

| Parâmetro | Valor no código | Default da API | Problema |
|-----------|----------------|----------------|----------|
| `strength` | `0.75` | `0.95` | Valor baixo = menos transformação. Pode ser intencional, mas filtros artísticos geralmente precisam de mais strength |
| `num_inference_steps` | `28` | `40` | Abaixo do recomendado — menos qualidade, mais velocidade |
| `guidance_scale` | `7.5` | `3.5` | Dobro do default — força demais o prompt, pode gerar artefatos |
| `image_size` | `{ width: 720, height: 1280 }` | **Não existe na API** | Parâmetro ignorado pela API — não faz nada |

### Problemas no `generate-gallery-image` (`flux-2-pro/edit`)

| Parâmetro | Status |
|-----------|--------|
| `image_urls` | ✅ OK |
| `prompt` | ✅ OK |
| `seed` | ✅ OK |
| `image_size` | ✅ OK (aceita enum ou object) |
| `safety_tolerance` | ✅ OK (já corrigido para string) |
| `output_format` | ✅ OK |

O `flux-2-pro/edit` está correto. Os problemas estão apenas no path default do `apply-ai-filter`.

---

### Correções necessárias

**Arquivo: `supabase/functions/apply-ai-filter/index.ts`** — bloco default (linhas 133-141)

Ajustar os parâmetros para valores mais alinhados com a API:

```typescript
// ANTES
falBody = {
  image_url: inputImage,
  prompt: filter.prompt,
  strength: 0.75,
  num_inference_steps: 28,
  guidance_scale: 7.5,
  image_size: { width: 720, height: 1280 },
};

// DEPOIS
falBody = {
  image_url: inputImage,
  prompt: filter.prompt,
  strength: 0.85,
  num_inference_steps: 40,
  guidance_scale: 3.5,
};
```

Mudanças:
1. `strength`: `0.75` → `0.85` — mais transformação para filtros artísticos, mas preserva estrutura
2. `num_inference_steps`: `28` → `40` — qualidade padrão recomendada
3. `guidance_scale`: `7.5` → `3.5` — valor default da API, reduz artefatos
4. `image_size` removido — parâmetro não existe nesta API, era ignorado

### Detalhes técnicos
- 1 arquivo modificado: `supabase/functions/apply-ai-filter/index.ts`
- Nenhuma mudança no frontend ou banco de dados
- O `flux-2-pro/edit` (generate-gallery-image) não precisa de correção

