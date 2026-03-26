

## Otimizar Imagens no Upload — Conversão Automática para WebP

### Problema

Os uploads de imagens no admin (coleções, designs, galerias, produtos, device images) enviam arquivos no formato original (JPG/PNG), muitos com 1-2MB+. Apenas o `UserGenerationsManager` já converte para WebP antes do upload.

### Solução

Criar uma função utilitária `optimizeForUpload` que redimensiona (max 800px) e converte para WebP (qualidade 80%) antes de qualquer upload ao storage. Aplicar em todos os pontos de upload do admin.

### Função utilitária (novo)

**`src/lib/image-utils.ts`** — adicionar:

```typescript
export function optimizeForUpload(
  file: File, maxSize = 800, quality = 0.80
): Promise<Blob>
```

- Carrega a imagem via `createImageBitmap`
- Redimensiona mantendo aspect ratio (max 800px no maior lado)
- Usa `OffscreenCanvas` + `convertToBlob({ type: "image/webp", quality })`
- Se o navegador não suportar `OffscreenCanvas`, faz fallback com `<canvas>` + `toBlob`
- Retorna um Blob WebP

### Arquivos modificados (6 pontos de upload)

| Arquivo | Upload atual | Mudança |
|---------|-------------|---------|
| `CollectionDesignsManager.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |
| `CollectionsManager.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |
| `ImageGalleriesManager.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |
| `GalleryImagesManager.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |
| `DeviceImageUpload.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |
| `ProductImagesUpload.tsx` | PNG/JPG direto | Otimizar → WebP, path `.webp` |

Cada mudança: importar `optimizeForUpload`, chamar antes do `.upload()`, usar `contentType: "image/webp"` e extensão `.webp` no path.

**`upload-gallery-zip/index.ts`** — manter sem mudança (edge function no Deno, sem canvas; imagens já são processadas no admin individual).

### Edge Function para imagens existentes (novo)

**`supabase/functions/optimize-existing-images/index.ts`**

Edge function admin-only que:
1. Lista arquivos pesados no bucket `product-assets` (galleries/, collections/)
2. Baixa cada imagem, redimensiona para max 800px e converte para WebP via `sharp` ou API de imagem
3. Re-upload com path `.webp` e atualiza as URLs nas tabelas `gallery_images`, `collection_designs`, `collections`, `products`

Isso resolve os ~13MB de imagens pesadas já existentes.

### Resultado esperado

- Novos uploads: ~50-200KB ao invés de 1-2MB
- Imagens existentes: otimizadas via edge function one-shot
- Redução estimada de 80-90% no payload de imagens

