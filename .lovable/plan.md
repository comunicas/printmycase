

## Mover Upscale para Filtros IA como Modelo Configurável

### Resumo
Remover o botão de Upscale do painel de Ajustes e transformá-lo em um filtro IA configurável pelo admin, usando o mesmo fluxo dos outros filtros fal.ai.

### Alterações

**1. `src/components/customize/AdjustmentsPanel.tsx`** — Remover upscale
- Remover props: `onUpscale`, `isHD`, `upscaleCost`, `isUpscaling`
- Remover o botão de Upscale IA
- Remover import do `Sparkles`

**2. `src/components/customize/MobileTabOverlay.tsx`** — Remover props de upscale do AdjustmentsPanel

**3. `src/pages/Customize.tsx`** — Limpar referências
- Remover props de upscale passadas ao AdjustmentsPanel e MobileTabOverlay
- Remover `UpscaleConfirmDialog` e seu import
- Manter `ImageControls.onUpscaleClick` por enquanto se usado no preview (ou remover também)

**4. `supabase/functions/apply-ai-filter/index.ts`** — Adicionar branch para `fal-ai/aura-sr`
- Detectar `isUpscale = modelUrl.includes("aura-sr")`
- Quando upscale: usar Queue API (submit → poll → fetch result) como já faz o `upscale-image`
- Body: `{ image_url: inputImage, upscale_factor: 4, overlapping_tiles: true }`
- Resultado vem em `falResult.image.url` (singular, não array)
- Manter timeout de polling ~150s

**5. `src/components/admin/AiFiltersManager.tsx`** — Adicionar modelo
- Adicionar `{ value: "fal-ai/aura-sr", label: "Aura SR (Upscale 4x)" }` ao `MODEL_OPTIONS`

**6. Limpeza opcional**
- O edge function `upscale-image` e o `UpscaleConfirmDialog` podem ser mantidos ou removidos. Recomendo manter por ora e remover numa iteração futura.
- Remover `handleUpscaleClick`/`handleUpscaleConfirm` do `useCustomizeFilters` e props relacionadas

### Detalhes técnicos — Branch no apply-ai-filter

```typescript
const isUpscale = modelUrl.includes("aura-sr");

if (isUpscale) {
  // Queue API (como upscale-image)
  const submitRes = await fetch(`https://queue.fal.run/${modelUrl}`, {
    method: "POST",
    headers: { Authorization: `Key ${falApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: inputImage, upscale_factor: 4, overlapping_tiles: true }),
  });
  // Poll loop (50 attempts × 3s)
  // Result: falResult.image.url (não images[])
}
```

O custo será o `ai_filter_cost` padrão (configurável no admin). O admin cria um filtro com modelo "Aura SR (Upscale 4x)", define nome/imagem/categoria como qualquer outro filtro.

