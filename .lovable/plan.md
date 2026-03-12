

## Revisão Completa + "Copiar Setup" nas Gerações

### O que será feito

1. **Migration**: Adicionar colunas `image_urls text[]`, `safety_tolerance integer`, `output_format text` à tabela `ai_generated_images` para persistir o setup completo.

2. **Edge Function (`generate-gallery-image/index.ts`)**: Salvar os novos campos (`image_urls`, `safety_tolerance`, `output_format`) no insert.

3. **Frontend — AiImageGenerator.tsx**: 
   - Aceitar prop opcional `initialSetup` com dados pré-preenchidos (prompt, seed, imageSize, safetyTolerance, outputFormat, imageUrls).
   - Quando receber `initialSetup`, preencher todos os campos automaticamente (incluindo carregar as URLs de referência como previews).
   - Limpar código legado e garantir tipagem correta.

4. **Frontend — AiGenerationsManager.tsx**:
   - Botão **"Copiar Setup"** em cada card — ao clicar, passa o setup da geração para o `AiImageGenerator` via estado, scrollando para o topo do formulário.
   - Também disponível no lightbox.
   - Remover casts `as any` desnecessários, tipar corretamente.

### Arquivos

| Arquivo | Alteração |
|---|---|
| Migration SQL | `ALTER TABLE ai_generated_images ADD COLUMN image_urls text[] DEFAULT '{}', ADD COLUMN safety_tolerance integer DEFAULT 2, ADD COLUMN output_format text DEFAULT 'png'` |
| `supabase/functions/generate-gallery-image/index.ts` | Incluir `image_urls`, `safety_tolerance`, `output_format` no insert |
| `src/components/admin/AiImageGenerator.tsx` | Prop `initialSetup`, preencher campos, scroll ao receber setup |
| `src/components/admin/AiGenerationsManager.tsx` | Botão "Copiar Setup", passar dados ao generator, cleanup de tipos |

### Detalhes técnicos

- O `initialSetup` carrega URLs de referência diretamente (já são públicas no storage), sem precisar re-upload.
- Ao clicar "Copiar Setup", o generator recebe o setup via `useState` e faz `scrollIntoView` do formulário.
- As imagens de referência do setup anterior ficam como preview (URLs públicas carregadas diretamente no `<img>`).

