

# Galeria de Imagens: Selecionar do Storage Existente

## Entendimento
O usuário quer que "Imagens da Galeria" funcione como um **seletor de imagens já existentes no bucket `product-assets`** do storage — não como um upload de novos arquivos. O admin deve ver todas as imagens disponíveis no storage e selecionar quais associar ao produto.

## Plano

### 1. Reescrever `ProductImagesUpload` como seletor de imagens do storage
- Ao abrir, listar todos os arquivos do bucket `product-assets` via `supabase.storage.from("product-assets").list()`
- Exibir grid com todas as imagens disponíveis no storage
- Permitir selecionar/deselecionar imagens com checkbox ou clique (toggle)
- Imagens já associadas ao produto ficam pré-selecionadas
- Ao alterar a seleção, chamar `onChange` com o array atualizado de URLs públicas
- Manter botão de remover nas imagens já selecionadas

### 2. Manter upload como opção secundária
- Manter o botão de upload existente para que o admin possa enviar novas imagens ao storage quando necessário
- Após upload, a nova imagem aparece automaticamente na galeria disponível

### 3. Sem alterações nos demais arquivos
- `ProductFormDialog` e `ProductGallery` já funcionam com array de URLs — não precisam de mudança

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/ProductImagesUpload.tsx` | Reescrever para listar imagens do storage e permitir seleção |

