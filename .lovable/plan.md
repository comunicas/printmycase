

## Corrigir lógica do "Expandir" para cobrir 100% do frame

### Problema

A fórmula atual está **invertida**. Para imagens mais largas que o phone (imgRatio > phoneRatio), ela calcula `phoneRatio / imgRatio * 100`, resultando em um scale **menor** que 100 — o oposto do necessário.

Analisando o rendering no `PhonePreview`, a largura real renderizada da imagem é `scale% × PHONE_W`, e a altura é proporcional ao aspect ratio. Para cobrir 100% do frame:

- **Largura**: `scale >= 100`
- **Altura**: `scale >= 100 × (imgRatio / phoneRatio)`

Ou seja: `minScale = max(100, ceil(100 × imgRatio / phoneRatio))`

Para uma imagem mais larga, precisamos de **mais** zoom (não menos) para que a altura preencha o frame.

### Mudança

**Arquivo**: `src/pages/Customize.tsx`, função `handleExpand` (linhas 111-129)

**De:**
```js
if (imgRatio > phoneRatio) {
  newScale = Math.ceil((phoneRatio / imgRatio) * 100);
} else {
  newScale = 100;
}
```

**Para:**
```js
newScale = imgRatio > phoneRatio
  ? Math.ceil((imgRatio / phoneRatio) * 100)
  : 100;
```

Uma única inversão de fração. Resultado: imagem sempre cobre 100% do frame, sem bordas vazias.

