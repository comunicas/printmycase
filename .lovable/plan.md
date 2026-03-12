

## Gerador IA — Controles do Modelo + Galeria "Gerações"

### Mudanças

**1. Nova tabela `ai_generated_images`** — galeria separada para imagens geradas por IA

| Coluna | Tipo | Nota |
|---|---|---|
| id | uuid PK | |
| url | text | URL pública no storage |
| prompt | text | Prompt usado |
| seed | integer | Seed retornado pela API |
| image_size | text | Tamanho usado |
| created_at | timestamptz | |

RLS: admins gerenciam tudo, leitura pública.

**2. Edge Function `generate-gallery-image`** — adicionar parâmetros

Passar para a fal.ai: `seed` (opcional), `image_size` (default `auto`), `safety_tolerance`, `output_format`. Salvar na tabela `ai_generated_images` em vez de `product_gallery_images`. Retornar o seed da resposta para referência futura.

Upload no storage em `generations/` (separado de `gallery/`).

**3. UI `AiImageGenerator.tsx`** — novos controles

- **Image Size**: dropdown com opções `auto, square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9`
- **Seed**: input numérico opcional (para reproduzir gerações anteriores)
- **Safety Tolerance**: slider 1-5 (default 2)
- **Output Format**: toggle jpeg/png

**4. Nova aba/seção "Gerações" no Admin**

Componente `AiGenerationsManager.tsx` para listar imagens geradas com:
- Preview, prompt usado, seed, data
- Botão copiar seed
- Botão deletar
- Opção de mover para galeria global (insere em `product_gallery_images`)

Adicionar sub-aba "Gerações" dentro da aba Galeria do admin.

### Arquivos

| Arquivo | Alteração |
|---|---|
| Migration SQL | Nova tabela `ai_generated_images` |
| `supabase/functions/generate-gallery-image/index.ts` | Aceitar novos params, salvar em nova tabela |
| `src/components/admin/AiImageGenerator.tsx` | Controles de image_size, seed, safety_tolerance, output_format |
| `src/components/admin/AiGenerationsManager.tsx` | **Novo** — listagem de gerações |
| `src/components/admin/GalleryImagesManager.tsx` | Remover AiImageGenerator (vai para Gerações) |
| `src/pages/Admin.tsx` | Sub-abas Galeria: "Ilustrativas" + "Gerações" |

