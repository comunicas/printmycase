

## Upload de Thumbnail no Admin

Permitir upload direto de imagem para thumbnail dos posts do Instagram, usando o bucket `product-assets` já existente.

### Alterações

**`src/components/admin/InstagramPostsManager.tsx`**
- Adicionar um `<input type="file" accept="image/*">` ao lado do campo "URL da Thumbnail" no formulário de edição
- Ao selecionar arquivo: fazer upload para `product-assets/instagram/{postId}-thumb.webp` via Supabase Storage
- Após upload, preencher automaticamente o campo `thumbnail_url` com a URL pública gerada
- Manter o campo de texto para colar URL manualmente como fallback
- Mostrar preview da imagem (já existe no form atual)

### Detalhes técnicos
- Bucket `product-assets` já é público — URLs funcionam direto
- Otimizar imagem antes do upload usando `OffscreenCanvas` (WebP 80%) seguindo o padrão do projeto
- Para posts novos (sem ID ainda), gerar um UUID temporário para o path do storage

