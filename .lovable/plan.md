

## Plano: Adicionar modelo Lighting Restoration

### API
O modelo `fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration` usa prompt fixo otimizado — só precisa de `image_urls` (array de strings). Não requer prompt do usuário.

### Alterações

#### 1. Admin UI (`AiFiltersManager.tsx`)
- Adicionar ao `MODEL_OPTIONS`: `{ value: "fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration", label: "Lighting Restoration" }`
- Quando este modelo estiver selecionado, esconder o campo de prompt/estilo/efeito (não é necessário input — prompt fixo interno)
- Ajustar validação do botão Salvar para não exigir `prompt` quando for este modelo

#### 2. Edge Function (`apply-ai-filter/index.ts`)
- Detectar modelo via `modelUrl.includes("lighting-restoration")`
- Construir body específico: `{ image_urls: [imageBase64], image_size: { width: 720, height: 1280 } }`
- Nota: este modelo usa `image_urls` (array) em vez de `image_url` (string)

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/AiFiltersManager.tsx` | Novo modelo, esconder prompt quando selecionado |
| `supabase/functions/apply-ai-filter/index.ts` | Body específico para lighting-restoration |

