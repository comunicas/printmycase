

# Upload de Imagens de Aparelho via Painel Admin

Sim! A melhor abordagem é adicionar um campo de upload de arquivo no formulário de produto do admin, usando o bucket de storage já existente.

## Plano

### 1. Criar bucket `product-assets` (migração SQL)
- Bucket público para armazenar imagens dos aparelhos
- RLS: admins podem fazer upload/delete, qualquer um pode visualizar

### 2. Atualizar `ProductFormDialog`
- Substituir o input de texto `device_image` por um campo de upload de arquivo (input type="file")
- Ao selecionar uma imagem, fazer upload para `product-assets/{product_id}/device.webp`
- Gerar a URL pública e salvar no campo `device_image` do produto
- Mostrar preview da imagem atual se já existir
- Manter opção de colar URL manualmente como fallback

### 3. Fluxo do admin
1. Abrir formulário de edição do produto
2. Clicar em "Enviar imagem" ou arrastar arquivo
3. Imagem é enviada ao storage e URL salva automaticamente

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| Migração SQL | Criar bucket `product-assets` + políticas |
| `src/components/admin/ProductFormDialog.tsx` | Campo de upload de imagem com preview |

