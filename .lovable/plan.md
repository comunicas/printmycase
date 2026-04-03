

## Code Review: Implementação de Imagem Posição + Limpeza de Legados

### Problemas Encontrados

**1. Campos legados `brightness` e `contrast` no Checkout**
- `src/pages/Checkout.tsx` (linhas 27-28, 96-97, 214-215): O `CustomizationData` interface e o payload do checkout ainda incluem `brightness` e `contrast`, que foram removidos do editor de customização. Estão sempre fixos em `100` — código morto.

**2. `data-capture-ignore` órfão no PhonePreview**
- `src/components/PhonePreview.tsx` (linhas 243, 279): O atributo `data-capture-ignore` era usado pelo `html2canvas` (já removido). Agora não serve para nada — é legado da implementação anterior.

**3. JSDoc duplicado/legado em `image-utils.ts`**
- Linha 158: `/** Render a preview image with the device mockup frame overlaid */` — comentário fantasma da função antiga `renderPreviewWithMockup` que já não existe. A linha 159 tem o JSDoc correto.

**4. `previewImage` não restaurado no fallback do Checkout**
- `src/pages/Checkout.tsx` (linha 92): Quando o checkout recupera do DB, `previewImage` é forçado a `null`. Deveria tentar restaurar de `cd.previewImagePath` via signed URL para que o mockup seja reenviado corretamente no upload.

**5. `previewImagePath` salvo no `customization_data` do pending mas nunca restaurado**
- `src/hooks/useCustomize.tsx` (linha 570): O `previewImagePath` é salvo dentro do `customization_data`, mas no restore do pending checkout (linhas 143-171) nunca é recuperado. Resultado: se o usuário volta da sessão, a "Imagem Posição" é perdida.

**6. Variável `errorMsg` declarada mas nunca usada**
- `src/hooks/useCustomize.tsx` (linha 411): `const errorMsg = data?.error || "Tente novamente.";` — variável declarada e nunca consumida.

**7. ARCHITECTURE.md desatualizado**
- Não menciona `renderPhoneMockup` nem o fluxo de "Imagem Posição"
- Não documenta os 4 tipos de imagem (Original, Otimizada, Recorte, Imagem Posição)
- Não documenta os componentes `UploadSpotlight`, `IntroDialog`, `GalleryPicker`, `GalleryTab`, `TermsDialog`, `ModelSelector` na árvore de pastas
- Não lista edge functions mais recentes: `handle-email-suppression`, `handle-email-unsubscribe`, `optimize-existing-images`, `prerender`, `preview-transactional-email`, `process-email-queue`, `send-transactional-email`, `sitemap`, `upload-gallery-zip`, `verify-coin-purchase`

### Correções Propostas

**1. `src/pages/Checkout.tsx`**
- Remover `brightness` e `contrast` do `CustomizationData` interface
- Remover do fallback restore (linhas 96-97)
- Remover do `customizationPayload` (linhas 214-215)
- Restaurar `previewImage` do DB via `cd.previewImagePath` + signed URL no fallback

**2. `src/components/PhonePreview.tsx`**
- Remover atributos `data-capture-ignore` (2 ocorrencias)

**3. `src/lib/image-utils.ts`**
- Remover JSDoc fantasma da linha 158

**4. `src/hooks/useCustomize.tsx`**
- Remover variável `errorMsg` não usada (linha 411)
- Remover a segunda `errorMsg` não usada no `handleFilterConfirm` (linha 354, se existir)

**5. `ARCHITECTURE.md`**
- Adicionar seção "Pipeline de Imagens" documentando os 4 tipos
- Atualizar árvore de pastas com componentes novos
- Atualizar lista de edge functions
- Documentar `renderPhoneMockup` em `image-utils.ts`

### Resultado
- 5 arquivos editados
- Zero código morto remanescente
- Documentação atualizada e fiel ao estado atual

