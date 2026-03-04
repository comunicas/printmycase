

# Galeria de Imagens do Produto via Upload

## Objetivo
Substituir o campo de texto "Imagens (URLs, uma por linha)" por um sistema de upload múltiplo de imagens, similar ao `DeviceImageUpload`, permitindo anexar várias fotos da galeria ao produto.

## Plano

### 1. Criar componente `ProductImagesUpload`
- Novo componente `src/components/admin/ProductImagesUpload.tsx`
- Exibe grid de previews das imagens já adicionadas (com botão de remover cada uma)
- Botão para adicionar mais imagens (input file com `multiple`)
- Upload para `product-assets/{productId}/gallery-{index}.{ext}`
- Retorna array de URLs públicas

### 2. Atualizar `ProductFormDialog`
- Substituir o `<textarea>` de URLs pelo novo componente `ProductImagesUpload`
- O state `imagesRaw` (string) passa a ser gerido como array de URLs
- Ao salvar, o array de URLs é persistido na coluna `images` do produto

### 3. Atualizar `ProductGallery` (frontend público)
- Combinar `device_image` + `images[]` na galeria (device_image primeiro, depois as da galeria)
- Exibir thumbnails navegáveis quando houver mais de uma imagem

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/ProductImagesUpload.tsx` | Novo componente de upload múltiplo |
| `src/components/admin/ProductFormDialog.tsx` | Trocar textarea por novo componente |
| `src/components/ProductGallery.tsx` | Combinar device_image + images na galeria |

