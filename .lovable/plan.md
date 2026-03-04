

# Usar apenas imagens reais (device_image) nos produtos

## Contexto
Os produtos têm um array `images` com URLs mocadas/placeholder e um campo `device_image` com a foto real enviada via upload. O objetivo é usar apenas as imagens reais.

## Plano

### 1. Atualizar `ProductCard` — usar `device_image` como imagem principal
- Priorizar `device_image` sobre `images[0]`
- Fallback para `images[0]` caso `device_image` não exista
- Mostrar placeholder genérico se nenhuma imagem existir

### 2. Atualizar `ProductGallery` — mostrar apenas imagens reais
- Se `device_image` existir, usá-la como imagem principal
- Não exibir as imagens do array `images` (que são mocadas)
- Manter a galeria funcional para quando houver múltiplas imagens reais no futuro

### 3. Migração SQL — limpar array `images` dos produtos
- `UPDATE products SET images = '{}' WHERE true;` — esvaziar o array de imagens mocadas de todos os produtos

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/ProductCard.tsx` | Usar `device_image` como fonte principal |
| `src/components/ProductGallery.tsx` | Remover dependência do array `images` mocado |
| Migração SQL | Limpar array `images` |

