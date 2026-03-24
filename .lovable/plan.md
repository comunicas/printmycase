

## Galeria de Imagens para Customização

### Conceito

Criar um sistema de galerias de imagens pré-prontas que o usuário pode escolher na tela de customização quando não tem uma foto própria. Cada galeria é uma coleção temática (ex: "Paisagens", "Animais", "Abstrato").

### Estrutura do banco

**Nova tabela `image_galleries`** — categorias/galerias:
- `id`, `name`, `slug`, `cover_image` (URL), `sort_order`, `active`, `created_at`

**Nova tabela `gallery_images`** — imagens dentro de cada galeria:
- `id`, `gallery_id` (FK → image_galleries), `url`, `label`, `sort_order`, `active`, `created_at`

RLS: admins podem tudo, público pode ler galerias/imagens ativas.

### Upload das imagens (ZIP)

Opção mais prática: criar uma funcionalidade no admin que aceita um arquivo ZIP, extrai as imagens e faz upload automático para o bucket `product-assets` (pasta `galleries/{gallery_id}/`).

Isso seria um **edge function** `upload-gallery-zip` que:
1. Recebe o ZIP + `gallery_id`
2. Extrai cada imagem do ZIP
3. Faz upload para o storage
4. Insere registros na tabela `gallery_images`

Alternativa simples: upload individual no admin (como já existe no `GalleryImagesManager`), mas para dezenas de imagens seria tedioso.

### Admin

**Nova aba "Galerias de Imagens"** no admin com:
- CRUD de galerias (nome, slug, cover)
- Upload de ZIP para popular uma galeria de uma vez
- Lista de imagens por galeria com reordenação e ativação

### Customização (frontend)

Na tela de customização (`Customize.tsx`), adicionar uma nova tab ou botão "Galeria" no `ImageControls` (ou diretamente no `PhonePreview` quando não há imagem).

Quando o usuário clica:
1. Abre um dialog/drawer com as galerias disponíveis
2. Usuário escolhe uma galeria → vê as imagens em grid
3. Ao clicar numa imagem, ela é carregada como se tivesse sido feita upload (reutiliza `setImageWithResolution`)

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | Migração SQL | Criar tabelas `image_galleries` e `gallery_images` com RLS |
| 2 | `supabase/functions/upload-gallery-zip/index.ts` | Edge function para processar ZIP e popular galeria |
| 3 | `src/components/admin/ImageGalleriesManager.tsx` | CRUD de galerias + upload ZIP + gestão de imagens |
| 4 | `src/pages/Admin.tsx` | Adicionar nova aba para galerias |
| 5 | `src/components/customize/GalleryPicker.tsx` | Dialog/drawer com grid de galerias e imagens para o usuário escolher |
| 6 | `src/pages/Customize.tsx` | Integrar GalleryPicker, passar callback para aplicar imagem selecionada |
| 7 | `src/hooks/useCustomize.tsx` | Adicionar `handleGalleryImageSelect(url)` que carrega a URL como imagem |

### Fluxo do ZIP

```text
Admin faz upload do ZIP
        ↓
Edge function recebe ZIP + gallery_id
        ↓
Extrai imagens (JSZip no Deno)
        ↓
Upload cada imagem → storage bucket
        ↓
Insere registros em gallery_images
        ↓
Admin vê imagens populadas
```

### Fluxo do usuário

```text
Tela de customização (sem imagem)
        ↓
Clica em "Escolher da Galeria" (ou tab Galeria)
        ↓
Dialog mostra galerias disponíveis
        ↓
Seleciona galeria → vê grid de imagens
        ↓
Clica em imagem → carregada no preview
        ↓
Continua customização normal (filtros, ajustes, etc.)
```

