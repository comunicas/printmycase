

## Logs detalhados + Toggle "Enviar imagem de referência" no Admin

### Alterações

**1. Nova coluna `send_style_image` na tabela `ai_filters`**
- Migração: `ALTER TABLE ai_filters ADD COLUMN send_style_image boolean NOT NULL DEFAULT true;`
- Controla se a `style_image_url` é enviada ao fal.ai (permite manter a imagem cadastrada mas não enviá-la)

**2. `src/components/admin/AiFiltersManager.tsx`**
- Adicionar estado `sendStyleImage` (boolean, default true)
- No formulário, abaixo do upload de imagem de referência, exibir um checkbox/switch "Enviar imagem de referência ao fal.ai" (visível apenas quando `styleImageUrl` tem valor)
- Salvar `send_style_image` junto com os demais campos no insert/update
- Carregar o valor de `send_style_image` ao abrir edição

**3. `supabase/functions/apply-ai-filter/index.ts`**
- Incluir `send_style_image` no select do filtro
- No bloco Style Transfer: só adicionar `style_reference_image_url` se `filter.send_style_image === true`
- Nos demais modelos que usam `style_image_url`: mesma lógica
- Adicionar logs detalhados nos pontos-chave:
  - Após buscar filtro: `[filter] id, prompt, model_url, has_style_image, send_style_image`
  - Antes de chamar fal.ai: `[fal-request] model, body_keys (sem base64)`
  - Após resposta: `[fal-response] status, images_count`
  - Após dedução de moedas: `[coins] userId, cost, balance`

### Fluxo resultante
- Admin pode fazer upload de imagem de referência E decidir se ela é enviada ou não via toggle
- Logs detalhados permitem debugar cada chamada ao fal.ai sem expor dados sensíveis

