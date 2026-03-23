

## Fix CORS, Download e Responsividade da Customização

### Problema raiz: CORS em URLs fal.ai

O edge function retorna `imageUrl` do fal.ai (URL temporária). O frontend tenta `urlToDataUrl(fetch())` que falha por CORS. O fallback usa a URL crua — funciona para `background-image` (sem CORS) mas falha para `handleDownload` (usa `fetch()`).

**Solução**: O edge function deve baixar o resultado do fal.ai e fazer upload para o Supabase Storage, retornando uma URL pública do storage. Isso resolve CORS para display E download.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `supabase/functions/apply-ai-filter/index.ts` | Após receber resultado do fal.ai: fetch imagem → upload para `customizations/{userId}/filter_{ts}.jpg` → retornar `signedUrl` do storage (válida por 1h) |
| 2 | `supabase/functions/upscale-image/index.ts` | Mesma lógica: download resultado → upload storage → retornar signed URL |
| 3 | `src/hooks/useCustomize.tsx` | Simplificar `handleFilterConfirm`: remover try/catch de `urlToDataUrl` — a URL retornada já é do storage (sem CORS). Remover import `urlToDataUrl` se não usado em outro lugar |
| 4 | `src/lib/image-utils.ts` | Remover `urlToDataUrl` (não mais necessário — todas as URLs vêm do storage) |
| 5 | `src/components/customize/AiFiltersList.tsx` | Responsividade: chips de histórico com scroll horizontal em vez de wrap; botões de ação menores no mobile |
| 6 | `src/pages/Customize.tsx` | Mobile: ajustar `max-h` da área de controles para não comprimir o preview |

### Detalhes técnicos

**Edge function — upload resultado para storage** (items 1-2):
```typescript
// Após receber outputUrl do fal.ai:
const imgRes = await fetch(outputUrl);
const imgBlob = await imgRes.arrayBuffer();
const path = `${userId}/filter_${Date.now()}.jpg`;
await serviceClient.storage.from("customizations").upload(path, imgBlob, {
  contentType: "image/jpeg", upsert: true
});
const { data: urlData } = await serviceClient.storage
  .from("customizations")
  .createSignedUrl(path, 3600); // 1h
return { imageUrl: urlData.signedUrl };
```

**Responsividade mobile** (items 5-6):
- Chips de filtros aplicados: `overflow-x-auto flex-nowrap` com scroll horizontal
- Botões "Comparar/Desfazer/Remover": ícones menores, sem texto no mobile (`sm:inline`)
- Área de controles mobile: `max-h-[35vh]` com scroll para não comprimir preview
- Grid de filtros: manter 3 colunas mas com gap menor no mobile

