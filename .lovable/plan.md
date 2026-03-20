

## Download de Imagem com Filtro IA

### Objetivo
Adicionar um botão de download da imagem filtrada em alta resolução, visível apenas quando um filtro IA está ativo.

### Alterações

**1. `src/components/customize/ContinueBar.tsx`**
- Adicionar props: `onDownload?: () => void` e `showDownload?: boolean`
- Quando `showDownload` for true, renderizar um botão com ícone `Download` ao lado do botão "Finalizar" (tanto no modo inline/desktop quanto no mobile)
- Botão com `variant="outline"` e tooltip "Baixar imagem"

**2. `src/hooks/useCustomize.tsx`**
- Criar `handleDownload` que:
  - Pega a imagem filtrada atual (`filteredImage` ou `image`)
  - Cria um link `<a>` com `download` attribute e dispara o download
  - Nome do arquivo: `printmycase-{productName}.jpg`
- Exportar `handleDownload` no retorno do hook

**3. `src/pages/Customize.tsx`**
- Passar `onDownload={c.handleDownload}` e `showDownload={!!c.activeFilterId}` para ambos os `ContinueBar` (mobile e desktop/inline)

### Resultado
- Botão de download aparece apenas quando filtro IA está aplicado
- Baixa a imagem filtrada em resolução original (sem crop/frame do preview)

