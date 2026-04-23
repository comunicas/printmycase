
Objetivo: simplificar a jornada de customização removendo a modal inicial de upload e eliminando o módulo de galeria da página `/customize`, deixando o fluxo começar direto no preview/upload padrão.

## O que será removido

### 1) Modal inicial da jornada
Remover o uso de `UploadSpotlight` em `src/pages/Customize.tsx` para que a tela não abra mais com o bloqueio/modal “Sua foto vira capa para...”.

Resultado esperado:
- a página abre direto na interface de customização
- o usuário usa o upload normal já existente no preview
- não existe mais CTA inicial “Escolher foto / Ou escolha da galeria”

### 2) Módulo Galeria da página Customize
Remover a galeria de toda a jornada de customização:

- aba `Galeria` do desktop em `src/components/customize/ImageControls.tsx`
- aba `Galeria` do mobile em `src/components/customize/MobileTabBar.tsx`
- conteúdo `GalleryTab` no overlay mobile em `src/components/customize/MobileTabOverlay.tsx`
- modal `GalleryPicker` montada em `src/pages/Customize.tsx`

Resultado esperado:
- desktop fica só com `Ajustes` e `Filtros IA` (quando existirem filtros)
- mobile fica só com tabs de `Ajustes` e `Filtros IA`
- não há mais fluxo paralelo de escolher imagem pela galeria

## Ajustes de integração

### `src/pages/Customize.tsx`
Vou limpar toda a cola de estado e handlers que hoje servem apenas para modal/galeria:
- remover imports de `GalleryPicker` e `UploadSpotlight`
- remover `showGalleryPicker`
- remover `spotlightInputRef`
- remover `handleSpotlightUpload`
- remover `handleSpotlightFile`
- remover `handleSpotlightGallery`
- parar de passar `onGalleryClick` para o preview
- remover a renderização de `GalleryPicker`
- remover a renderização de `UploadSpotlight`
- remover o input escondido ligado ao spotlight

### `src/components/customize/ImageControls.tsx`
Padronizar os controles sem galeria:
- remover import de `GalleryTab`
- remover prop `onGallerySelect`
- recalcular o grid das tabs para 1 ou 2 colunas conforme haja filtros
- manter apenas `Ajustes` e `Filtros IA`

### `src/components/customize/MobileTabBar.tsx`
Padronizar o menu mobile:
- remover tipo/tab `galeria`
- remover ícone e label de galeria
- manter somente tabs realmente disponíveis

### `src/components/customize/MobileTabOverlay.tsx`
Remover o painel de galeria:
- remover import de `GalleryTab`
- remover `onGallerySelect`
- remover título `Galeria`
- remover branch `activeTab === "galeria"`

### `src/components/PhonePreview.tsx`
Como a galeria sai da jornada:
- remover prop opcional `onGalleryClick` se estiver órfã
- manter apenas o upload pelo botão de câmera já existente

## Efeito visual esperado
A página ficará assim:

```text
Sem imagem:
- preview do aparelho visível
- botão de upload/câmera como entrada principal
- sidebar/rodapé mais enxutos
- sem modal de entrada
- sem aba de galeria
```

## Arquivos impactados
- `src/pages/Customize.tsx`
- `src/components/customize/ImageControls.tsx`
- `src/components/customize/MobileTabBar.tsx`
- `src/components/customize/MobileTabOverlay.tsx`
- `src/components/PhonePreview.tsx`

Possivelmente ficarão sem uso depois da limpeza:
- `src/components/customize/UploadSpotlight.tsx`
- `src/components/customize/GalleryPicker.tsx`
- `src/components/customize/GalleryTab.tsx`

## Critérios de aceite
- a página `/customize/:slug` não abre mais com modal inicial
- não existe mais botão/link “Ou escolha da galeria”
- não existe mais aba “Galeria” no desktop
- não existe mais aba “Galeria” no mobile
- o upload continua funcionando pelo preview
- o layout continua respeitando o padrão atual desktop/mobile

## Observação técnica
O erro de deploy informado (`failed to upload legacy files to R2 ... InternalError`) aparenta ser de infraestrutura/publicação e não do código dessa mudança. Depois da implementação, o ideal é publicar novamente para confirmar se foi apenas uma falha transitória do storage de deploy.
