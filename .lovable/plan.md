

## Corrigir captura da "Imagem Posição" — html2canvas falhando silenciosamente

### Diagnóstico
O `html2canvas` está falhando na captura do DOM do PhonePreview. Isso acontece porque:
- O preview usa CSS `background-image` com data URLs muito grandes
- Transforms CSS (rotate, scale via background-size/position) não são bem suportados pelo html2canvas
- O fallback `renderPreviewWithMockup` também falha silenciosamente (provavelmente CORS no `device_image`)
- Resultado: `preview_image_url` fica null — o pedido só salva o `edited_image_url` (recorte cru do renderSnapshot)

### Solução
Abandonar `html2canvas` e melhorar o `renderPreviewWithMockup` canvas-based para gerar uma imagem fiel ao visual do celular — com bordas arredondadas e frame escuro, simulando visualmente o que o usuário vê.

### Implementação

**1. `src/lib/image-utils.ts` — melhorar `renderPreviewWithMockup`**
- Adicionar bordas arredondadas no canvas (clip com roundRect) para simular o visual do celular
- Desenhar o frame escuro (border do PhonePreview) ao redor
- Se não houver `device_image`, desenhar um frame genérico com rounded rect + borda escura
- Criar nova função `renderPhoneMockup(imgSrc, scale, position, rotation)` que não depende de device_image — usa apenas canvas com clip arredondado + borda

**2. `src/hooks/useCustomize.tsx` — simplificar captura**
- Remover dependência do `html2canvas` e do `phoneCaptureRef`
- No `handleContinue`, gerar `previewImage` usando a nova `renderPhoneMockup()` (100% canvas, sem DOM)
- Isso é determinístico e nunca falha por CORS

**3. `src/pages/Customize.tsx`**
- Remover `phoneCaptureRef` (não mais necessário)
- Remover prop `captureRef` do PhonePreview

**4. `src/components/PhonePreview.tsx`**
- Remover prop `captureRef` (cleanup)

**5. `package.json`**
- Remover dependência `html2canvas` (não mais usada)

### Detalhes técnicos da `renderPhoneMockup`
```text
┌─────────────────┐
│  borda escura    │  ← ctx.fillStyle = "#333", roundRect
│ ┌─────────────┐ │
│ │             │ │
│ │  imagem do  │ │  ← mesmo cálculo de scale/position/rotation
│ │  usuário    │ │     do renderSnapshot, com clip roundRect
│ │             │ │
│ └─────────────┘ │
└─────────────────┘
```
- Canvas 520x1064 (2x do frame 260x532)
- Clip com borderRadius ~44px (2x do 2.2rem)
- Borda de 8px (#333) ao redor
- Resultado: imagem PNG que parece exatamente o preview do celular

### Resultado
- "Imagem Posição" mostra o mockup visual do celular com a imagem posicionada
- Sem dependência de captura de DOM (nunca falha)
- Sem CORS issues
- Visualmente fiel ao que o usuário vê na tela de customização

