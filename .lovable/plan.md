

# Indicador de Progresso + Salvar Imagem Original e Editada

## 1. Indicador de progresso durante compressão (`Customize.tsx`)
- Adicionar estado `isCompressing` que exibe um overlay com spinner no `PhonePreview` enquanto a imagem é processada
- Passar `isCompressing` como prop ao `PhonePreview` para mostrar overlay de loading
- Desabilitar botão "Continuar" durante compressão

## 2. Overlay de loading no PhonePreview (`PhonePreview.tsx`)
- Nova prop `isProcessing?: boolean`
- Quando true, exibir overlay semi-transparente com `Loader2` animado e texto "Processando imagem..."

## 3. Salvar imagem original + imagem renderizada (`Customize.tsx` + `Checkout.tsx`)

**Fluxo ao clicar "Continuar":**
1. Gerar snapshot da imagem editada usando canvas — aplicar scale, position, rotation, brightness, contrast e filtro CSS sobre a imagem original, renderizando no tamanho do phone (260×532px ou proporcional)
2. Salvar no `sessionStorage` como `customization`:
   - `originalImage`: imagem original (ou comprimida) sem edições de posição
   - `editedImage`: snapshot renderizado com todas as edições aplicadas
   - Demais dados de customização (scale, rotation, etc.)

**No Checkout:**
3. Upload de **ambas** as imagens para o storage: `original_{timestamp}.ext` e `edited_{timestamp}.ext`
4. Enviar ambos os paths no payload do `create-checkout`

### Função de renderização do snapshot
```text
renderSnapshot(image, scale, rotation, brightness, contrast, filter, position)
  → canvas 260×532 → toDataURL JPEG 0.85
```

## Arquivos afetados
- `src/pages/Customize.tsx` — estado `isCompressing`, função `renderSnapshot`, dados extras no sessionStorage
- `src/components/PhonePreview.tsx` — prop `isProcessing` + overlay
- `src/pages/Checkout.tsx` — upload de ambas as imagens, interface atualizada

