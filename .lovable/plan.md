

## Revisão das 3 imagens do pedido

### Problema atual
O sistema salva apenas 2 imagens e confunde os conceitos:
- `originalImage` é sobrescrito pelo upscale, perdendo a imagem original real
- `editedImage` é o snapshot renderizado (com enquadramento), mas o label diz "Editada"
- Não há imagem intermediária (otimizada com filtro/upscale em resolução máxima)

### Nova definição
| # | Label | Conteúdo | Variável |
|---|-------|----------|----------|
| 1 | **Original** | Imagem crua que o usuário fez upload (nunca muda) | `rawImage` (novo) |
| 2 | **Otimizada** | Imagem após filtros IA e/ou upscale, em resolução máxima | `originalImage` (existente, renomeado conceitualmente) |
| 3 | **Final** | Otimizada renderizada com enquadramento no frame do smartphone | `editedImage` (snapshot via `renderSnapshot`) |

### Mudanças

**1. `src/hooks/useCustomize.tsx`**
- Adicionar estado `rawImage` — setado UMA vez no upload e nunca mais alterado
- No `handleImageUpload`: `setRawImage(url)` junto com `setOriginalImage(url)`
- Na restauração de rascunho/pending: restaurar `rawImage` da mesma fonte
- No `handleContinue`: salvar 3 imagens no storage:
  - `pending_raw_{ts}.{ext}` → imagem crua
  - `pending_optim_{ts}.jpg` → `originalImage` (com filtro/upscale)
  - `pending_final_{ts}.jpg` → snapshot renderizado
- Passar 3 paths para `upsertPending` e `sessionStorage`

**2. `src/hooks/usePendingCheckout.ts`** — adicionar campo `raw_image_path`

**3. `src/pages/Checkout.tsx`**
- Atualizar `CustomizationData` com `rawImage`
- Upload de 3 imagens no checkout: `original_{ts}` (raw), `optimized_{ts}` (otimizada), `final_{ts}` (snapshot)
- Enviar 3 URLs para `create-checkout`

**4. `supabase/functions/create-checkout/index.ts`**
- Aceitar `raw_image_url` adicional e salvar no `customization_data`

**5. `src/components/admin/OrderImagesPreviewer.tsx`**
- Carregar 3 imagens: `raw_image_url`, `original_image_url` (otimizada), `edited_image_url` (final)
- Labels: "Original", "Otimizada", "Final"
- Remover a renderização via `renderSnapshot` (a imagem final já vem pronta do storage)

**6. Migration** — adicionar coluna `raw_image_path` à tabela `pending_checkouts` (se existir)

### Resultado
O admin vê 3 imagens distintas e corretas:
- Original: foto crua do usuário
- Otimizada: foto processada com filtros/upscale em alta resolução
- Final: foto otimizada enquadrada no frame do smartphone

