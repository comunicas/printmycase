

## Corrigir imagem Final para replicar o frame do smartphone

### Problema
A função `renderSnapshot` usa matemática diferente do componente `PhonePreview`. O CSS do PhonePreview usa `background-size`, `background-position` e um truque de "oversize div", enquanto o canvas usa recorte de fonte (`drawImage` com src crop) — resultando em enquadramento completamente diferente.

### Solução
Reescrever `renderSnapshot` em `src/lib/image-utils.ts` para replicar exatamente a lógica CSS do `PhonePreview`:

**Lógica CSS do PhonePreview:**
```text
oversize = max(150, scale × 1.25)
divW = PHONE_W × oversize / 100
bgSize = scale × (100 / oversize) %
imgDrawW = divW × bgSize / 100 = PHONE_W × scale / 100
imgDrawH = imgDrawW / aspectRatio
position: (divW - imgW) × posX% offset from div edge
```

**Mudança em `src/lib/image-utils.ts` (função `renderSnapshot`, ~linhas 89-137):**

Substituir toda a lógica do canvas por:
1. Calcular `divW`, `divH`, `divLeft`, `divTop` (o div "oversize" deslocado)
2. Calcular `imgW` = `PHONE_W * scale / 100`, `imgH` = `imgW / aspect`
3. Calcular posição absoluta usando `background-position` CSS: `(divW - imgW) * posX / 100`
4. Desenhar com rotação aplicada ao redor do centro

Isso garante que o snapshot no canvas seja pixel-perfect com o que o usuário vê no preview CSS.

### Arquivo editado
- `src/lib/image-utils.ts` — reescrever `renderSnapshot`

