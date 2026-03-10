

## Imagens Ilustrativas Globais + Galeria no Produto

### Conceito
Criar uma tabela `product_gallery_images` para armazenar imagens ilustrativas (embalagem, material, detalhes de impressão) que aparecem em **todos** os produtos, após as imagens específicas. Essas imagens são gerenciadas via admin e nunca são usadas como thumbnail/capa.

### 1. Banco de dados — nova tabela

```sql
CREATE TABLE public.product_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_gallery_images ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver imagens ativas
CREATE POLICY "Anyone can view active gallery images"
  ON public.product_gallery_images FOR SELECT TO public
  USING (active = true);

-- Admins gerenciam
CREATE POLICY "Admins can manage gallery images"
  ON public.product_gallery_images FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2. Admin — novo manager `GalleryImagesManager`

- Nova aba "Galeria" no painel admin (ícone `ImageIcon`)
- Lista as imagens com preview, label editável, reordenação e toggle ativo/inativo
- Upload de novas imagens para o bucket `product-assets` (pasta `gallery/`)
- CRUD completo na tabela `product_gallery_images`

### 3. Página do Produto — integrar na galeria

- `ProductGallery.tsx`: receber prop `galleryImages` (array de URLs)
- Ordem: `device_image` → `images` (específicas) → `galleryImages` (ilustrativas)
- Separador visual opcional (label "Imagens ilustrativas") nas thumbnails
- `Product.tsx`: buscar `product_gallery_images` ativas, ordenadas por `sort_order`, e passar ao `ProductGallery`

### 4. Catálogo/Thumbnails — sem impacto

As imagens ilustrativas **não** afetam `ProductCard` nem thumbnails. Apenas aparecem na galeria da página de produto.

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/components/admin/GalleryImagesManager.tsx` | **Novo** — CRUD de imagens ilustrativas |
| `src/pages/Admin.tsx` | Adicionar aba "Galeria" |
| `src/components/ProductGallery.tsx` | Receber e exibir `galleryImages` após imagens do produto |
| `src/pages/Product.tsx` | Buscar `product_gallery_images` e passar ao gallery |

