

## Diagnóstico e Plano

### Bug do Expandir
O `handleExpand` retorna silenciosamente quando `imageResolution` é `null`. Isso acontece em dois cenários:
1. **Restauração de rascunho** (sessionStorage ou DB) — seta a imagem mas nunca popula `imageResolution`
2. **Qualquer caso** onde a resolução não foi calculada

**Correção**: Ao setar uma imagem (upload, restore, filtro, upscale), sempre garantir que `imageResolution` seja populada. Criar helper `loadImageResolution(src)` que retorna `{w, h}` via `Image.onload`.

### Refatoração do Customize.tsx (450 linhas → ~80)
Extrair toda a lógica de estado e handlers para um hook `useCustomize`:

```text
src/hooks/useCustomize.ts        (~350 linhas) — todo o estado + handlers
src/pages/Customize.tsx          (~80 linhas)  — apenas layout/JSX
```

O hook exporta um objeto flat com tudo que o JSX precisa: `image`, `scale`, `position`, `rotation`, `filters`, `handlers`, `flags`, `dialogs`.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/lib/image-utils.ts` | Adicionar `getImageResolution(src): Promise<{w,h}>` |
| `src/hooks/useCustomize.ts` | **Novo** — extrair todo estado/lógica de `Customize.tsx` |
| `src/pages/Customize.tsx` | Reduzir a layout puro usando `useCustomize()` |

### Correções incluídas no hook
1. **Expand**: usar `getImageResolution` para popular resolução quando null (lazy load da imagem atual)
2. **Draft restore**: chamar `getImageResolution` ao restaurar imagem
3. **Filtro/Upscale result**: atualizar `imageResolution` após receber resultado

### Componentes existentes mantidos
`PhonePreview`, `ImageControls`, `AdjustmentsPanel`, `AiFiltersList`, `ContinueBar`, `CustomizeHeader`, `FilterConfirmDialog`, `UpscaleConfirmDialog` — sem alterações.

