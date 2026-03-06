

## Plano: Imagem de referência de estilo nos Filtros IA

### Contexto
A API do Fal.ai Style Transfer (`fal-ai/image-apps-v2/style-transfer`) aceita o parâmetro `style_reference_image_url`. Quando fornecido, o estilo é inferido a partir dessa imagem em vez do preset selecionado. Isso permite estilos personalizados com imagem de referência.

Para os outros modelos (Flux Dev, Flux Pro Kontext, SD 3.5), a imagem de referência pode ser usada como `image_prompt_url` ou incorporada ao prompt — mas o uso mais direto e suportado é no Style Transfer.

### Alterações

#### 1. Migração de banco — Adicionar coluna `style_image_url`
```sql
ALTER TABLE public.ai_filters ADD COLUMN style_image_url text;
```

#### 2. Admin UI — Upload de imagem de referência no dialog de filtro
No `AiFiltersManager.tsx`:
- Adicionar estado `styleImageUrl` 
- Adicionar campo de upload de imagem (reutilizar padrão do `DeviceImageUpload` — upload para bucket `product-assets` com path `ai-filters/{filterId}/style.{ext}`)
- Exibir preview da imagem no card do filtro na lista
- Salvar/carregar `style_image_url` no CRUD

#### 3. Edge Function — Enviar `style_reference_image_url` ao Fal.ai
No `apply-ai-filter/index.ts`:
- Buscar `style_image_url` do filtro junto com `prompt` e `model_url`
- Se o modelo é Style Transfer e tem `style_image_url`, enviar como `style_reference_image_url` no body (substitui o preset `target_style`)
- Se não tem imagem, manter comportamento atual com `target_style` preset

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| Migração SQL | `ALTER TABLE ai_filters ADD COLUMN style_image_url text` |
| `src/components/admin/AiFiltersManager.tsx` | Campo de upload de imagem de referência no dialog + preview na lista |
| `supabase/functions/apply-ai-filter/index.ts` | Buscar `style_image_url` e enviar como `style_reference_image_url` ao Fal.ai |

