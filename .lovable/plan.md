

## Otimizar Imagens de Coleções e Galeria (Performance)

### Problema

O Lighthouse aponta **~14 MB** de imagens na landing page, majoritariamente PNGs de 1-1.4 MB (designs de coleções, 1024x1024) e JPGs de 2-2.5 MB (galeria pública, 2304x3456). Essas imagens foram uploadadas antes do sistema de otimização automática ser implementado. A edge function `optimize-existing-images` existente **não faz conversão real** — apenas renomeia o blob para `.webp` sem reprocessar.

### Solução (2 frentes)

**Frente 1 — Frontend: helper de transformação de URL (impacto imediato)**

Criar uma função `getOptimizedImageUrl(url, width)` em `src/lib/image-utils.ts` que, para URLs do Supabase Storage (`/object/public/`), troca o path para `/render/image/public/` e adiciona `?width=X&resize=contain&quality=80`. Isso usa o recurso nativo de transformação de imagem do Storage — sem re-upload necessário.

Aplicar nos componentes:
- `Landing.tsx` — designs de coleção (width=400)
- `AiCoinsSection.tsx` — galeria pública (width=400)
- `CollectionCard.tsx` — cover de coleção (width=400)
- `ProductGallery.tsx` — thumbnails (width=80) e imagem principal (width=600)

**Frente 2 — Edge function: otimização permanente com ImageScript**

Reescrever `optimize-existing-images/index.ts` usando a biblioteca `ImageScript` (pure JS, compatível com Deno) para:
1. Download do original
2. Decode (PNG/JPG)
3. Resize para max 800px
4. Encode como WebP (quality 80)
5. Upload do resultado
6. Atualizar referências no banco

### Detalhes Técnicos

**Novo helper (`src/lib/image-utils.ts`)**
```typescript
export function getOptimizedUrl(url: string, width = 400, quality = 80): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url;
  return url.replace(
    '/storage/v1/object/public/',
    `/storage/v1/render/image/public/`
  ) + `?width=${width}&resize=contain&quality=${quality}`;
}
```

**Componentes atualizados** — cada `<img src={url}>` com imagens do storage passa a usar `getOptimizedUrl(url, targetWidth)`.

**Edge function** — importar `ImageScript` de `https://deno.land/x/imagescript@1.3.0/mod.ts`, usar `Image.decode()` para ler, `.resize()` para redimensionar, `.encodeWebP()` para converter.

### Resultado esperado
- Frente 1: redução imediata de ~14 MB para ~1-2 MB na landing (imagens servidas redimensionadas on-the-fly)
- Frente 2: otimização permanente dos assets (menor latência futura, sem transformação on-the-fly)
- 3 arquivos de código modificados + 1 edge function reescrita
- Nenhuma mudança no banco de dados

