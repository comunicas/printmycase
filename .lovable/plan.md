
## Bloquear upload durante geração de filtro IA

Quando um filtro IA está sendo aplicado (`applyingFilterId` ativo), o usuário ainda consegue trocar a imagem via:
1. Botão Camera no `PhonePreview` (input file)
2. `UploadSpotlight` (não aplicável aqui, pois só aparece sem imagem)
3. Aba Galeria → `GalleryTab`

Trocar a imagem no meio da geração causa estados inconsistentes (filtro retorna sobre imagem antiga, history desalinhada, possível erro).

### Solução

Reutilizar `c.isProcessing` (que já inclui `applyingFilterId`, `isUpscaling`, `isRendering`, `isCompressing`) como guard.

**`src/pages/Customize.tsx`**
- Passar `isProcessing` ao `PhonePreview` para desabilitar o botão Camera.
- A `MobileTabBar` já recebe `disabled={c.isProcessing || !c.image}` ✅
- Verificar `ImageControls` desktop: a aba Galeria deve ficar desabilitada durante processamento.

**`src/components/PhonePreview.tsx`**
- Adicionar prop `disabled?: boolean`.
- Quando `disabled`, desabilitar o botão Camera (não dispara input).

**`src/components/customize/ImageControls.tsx`** (desktop)
- Adicionar prop `isProcessing`.
- Aplicar `opacity-50 pointer-events-none` na aba Galeria quando `isProcessing` (mesmo padrão das outras abas que usam `!hasImage`).
- Alternativamente, desabilitar o `TabsTrigger` da galeria.

### Mudança mínima

3 arquivos, ~6 linhas. Sem mudança de comportamento fora do estado "processando".
