
O usuário está vendo o `UploadSpotlight` (modal fullscreen quando não há imagem) e percebeu que os botões da `MobileTabBar` (Ajustes, Filtros IA, Galeria) e do `ContinueBar` (Finalizar) abaixo continuam clicáveis, mesmo o modal estando ativo. Isso pode causar comportamentos estranhos (abrir overlays atrás do modal).

## Análise

Em `src/pages/Customize.tsx`:
- O `UploadSpotlight` aparece quando `!c.image`.
- A `MobileTabBar` recebe `disabled={c.isProcessing}` — não considera ausência de imagem.
- O `ContinueBar` mobile já tem `disabled={!c.image || c.isProcessing}`, então o botão Finalizar já está desabilitado corretamente. ✅
- A `FilterHistoryBar` só aparece quando há histórico, então não é um problema agora.
- A `MobileTabBar` é o problema: clicar em "Galeria" abre o `MobileTabOverlay` por trás do spotlight.

## Plano

**Arquivo: `src/pages/Customize.tsx`**

Alterar a prop `disabled` da `MobileTabBar` para também considerar quando não há imagem:

```tsx
disabled={c.isProcessing || !c.image}
```

Isso desabilita as três abas (Ajustes, Filtros IA, Galeria) enquanto o `UploadSpotlight` está ativo, prevenindo cliques acidentais. O botão "Ou escolha da galeria" dentro do spotlight continua funcionando normalmente para abrir o `GalleryPicker`.

Mudança mínima, 1 linha.
