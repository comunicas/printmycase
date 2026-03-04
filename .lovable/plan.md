

# Refinar Página do Produto — Foco em Customização

## Mudanças

### 1. Migração: adicionar coluna `device_image` à tabela `products`
- Nova coluna `device_image text nullable` na tabela `products`
- Armazenará a URL de uma imagem de referência do aparelho (sem capa)
- Admin poderá fazer upload via painel existente

### 2. Atualizar tipo `Product` — `src/lib/types.ts`
- Adicionar campo `device_image: string | null`

### 3. Atualizar `mapRow` — `src/hooks/useProducts.ts`
- Mapear `device_image` do row

### 4. Simplificar `ProductInfo` — `src/components/ProductInfo.tsx`
- **Remover**: seletor de cores (state `selectedColor` + swatches)
- **Remover**: botão "Ver Catálogo Completo"
- Manter: nome, rating, preço, botão "Customizar Minha Case"

### 5. Exibir imagem do aparelho — `src/components/ProductGallery.tsx`
- Se `device_image` existir, exibir como imagem adicional na galeria (ou em destaque)
- Fallback: usar a primeira imagem do array `images` caso `device_image` seja null

### 6. Painel Admin — `src/components/admin/ProductFormDialog.tsx`
- Adicionar campo de input para URL da `device_image` no formulário de edição de produto

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| Migração SQL | `ALTER TABLE products ADD COLUMN device_image text` |
| `src/lib/types.ts` | Adicionar `device_image` |
| `src/hooks/useProducts.ts` | Mapear novo campo |
| `src/components/ProductInfo.tsx` | Remover cores e botão catálogo |
| `src/components/ProductGallery.tsx` | Suportar `device_image` |
| `src/components/admin/ProductFormDialog.tsx` | Campo para `device_image` |

