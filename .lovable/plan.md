

## Auto-definir cover_image das galerias

### Problema
As 3 galerias existentes (Brasil, Talk, Arte) têm `cover_image = null`, mostrando ícone genérico. Precisamos: (1) atualizar as existentes com a primeira imagem, (2) automatizar para uploads futuros.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | SQL (insert tool) | UPDATE para definir `cover_image` das galerias existentes usando a primeira imagem de cada uma (subquery em `gallery_images` ordenado por `sort_order` limit 1) |
| 2 | `supabase/functions/upload-gallery-zip/index.ts` | Após inserir imagens, verificar se a galeria tem `cover_image` null. Se sim, atualizar com a URL da primeira imagem enviada |
| 3 | `src/components/admin/ImageGalleriesManager.tsx` | No `handleSingleUpload`, após inserir imagem, verificar se galeria não tem cover e atualizar. No `handleZipUpload`, após sucesso, refetch da galeria para pegar cover atualizado |

### Detalhes

**Galerias existentes** — Um único UPDATE:
```sql
UPDATE image_galleries SET cover_image = (
  SELECT url FROM gallery_images 
  WHERE gallery_id = image_galleries.id 
  ORDER BY sort_order LIMIT 1
) WHERE cover_image IS NULL;
```

**Edge function** — Adicionar ao final do processamento do ZIP:
```typescript
if (uploaded.length > 0) {
  const { data: gal } = await adminClient.from("image_galleries").select("cover_image").eq("id", galleryId).single();
  if (!gal?.cover_image) {
    await adminClient.from("image_galleries").update({ cover_image: uploaded[0] }).eq("id", galleryId);
  }
}
```

**Admin frontend** — Mesma lógica no `handleSingleUpload`.

