

## Corrigir Aspect Ratio do Flux Dev + Adicionar Modelos Nano Banana Edit

### Correções e adições

**1. Flux Dev — adicionar `image_size` para forçar 9:16**

O bloco default (linhas 144-152) não tem configuração de tamanho. Adicionar `image_size: { width: 720, height: 1280 }`.

**2. Nano Banana 2 Edit + Nano Banana Pro Edit — novos modelos**

Ambos usam `image_urls` (array), `prompt`, `aspect_ratio: "9:16"`, `resolution: "1K"`, `safety_tolerance: "4"`.

### Alterações

**Arquivo 1: `src/components/admin/AiFiltersManager.tsx`** — adicionar 2 opções ao `MODEL_OPTIONS`:
```typescript
{ value: "fal-ai/nano-banana-2/edit", label: "Nano Banana 2 Edit" },
{ value: "fal-ai/nano-banana-pro/edit", label: "Nano Banana Pro Edit" },
```

**Arquivo 2: `supabase/functions/apply-ai-filter/index.ts`** — 2 mudanças:

1. Adicionar detecção `isNanoBanana`:
```typescript
const isNanoBanana = modelUrl.includes("nano-banana");
```

2. Adicionar handler antes do `else` default e corrigir o default:
```typescript
} else if (isNanoBanana) {
  falBody = {
    image_urls: [inputImage],
    prompt: filter.prompt,
    aspect_ratio: "9:16",
    output_format: "jpeg",
    resolution: "1K",
    safety_tolerance: "4",
    num_images: 1,
  };
} else {
  // Flux Dev default — agora com image_size 9:16
  falBody = {
    image_url: inputImage,
    prompt: filter.prompt,
    strength: 0.85,
    num_inference_steps: 40,
    guidance_scale: 3.5,
    image_size: { width: 720, height: 1280 },
  };
}
```

**Arquivo 3: `.lovable/plan.md`** — atualizar tabela de modelos com Nano Banana e status corrigido do Flux Dev.

### Resumo
- 2 arquivos de código + plano
- Nenhuma mudança no banco de dados
- Todos os 8 modelos passam a ter saída 9:16 garantida

