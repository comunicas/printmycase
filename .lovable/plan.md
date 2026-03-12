

## Gerador de Imagens IA no Admin (fal-ai/flux-2-pro/edit)

Ferramenta exclusiva para admins que permite enviar até 2 imagens + prompt, processar via fal-ai/flux-2-pro/edit, e salvar o resultado diretamente na galeria ilustrativa.

### 1. Edge Function — `generate-gallery-image`

Nova edge function que:
- Valida que o usuário é admin (via `has_role`)
- Recebe `image_urls` (array de até 2 URLs/base64) e `prompt`
- Chama `https://fal.run/fal-ai/flux-2-pro/edit` com esses parâmetros
- Baixa a imagem resultante e faz upload no bucket `product-assets` (pasta `gallery/`)
- Insere registro na tabela `product_gallery_images`
- Retorna a URL pública da imagem salva
- Sem cobrança de coins (ferramenta admin)

### 2. Admin UI — Seção no GalleryImagesManager

Adicionar um painel colapsável ou seção no topo do `GalleryImagesManager` com:
- 2 campos de upload de imagem (image 1 e image 2) com preview
- Campo de texto para o prompt
- Botão "Gerar Imagem"
- Loading state com mensagem de progresso
- Ao concluir, a imagem aparece na lista da galeria automaticamente

### 3. Config

Adicionar a nova função no `supabase/config.toml` com `verify_jwt = false`.

### Arquivos

| Arquivo | Alteração |
|---|---|
| `supabase/functions/generate-gallery-image/index.ts` | **Novo** — edge function |
| `supabase/config.toml` | Adicionar entry da função |
| `src/components/admin/GalleryImagesManager.tsx` | Adicionar UI de geração IA |

