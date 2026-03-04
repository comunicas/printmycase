

# Compressão Automática de Imagens Grandes

## Problema
Imagens de alta resolução (ex: 4000×8000px, 5MB+) são armazenadas como base64 no `sessionStorage`, que tem limite de ~5MB. Além disso, imagens muito grandes degradam performance do preview e do upload para o storage no checkout.

## Solução

### `src/pages/Customize.tsx` — Comprimir no `handleImageUpload`

Após ler a imagem com `FileReader`, antes de salvar no state:

1. Criar um `canvas` temporário
2. Se a imagem exceder **2000×4000px**, redimensionar proporcionalmente para caber nesse limite
3. Exportar como JPEG com qualidade 0.85 via `canvas.toDataURL('image/jpeg', 0.85)`
4. Usar o dataUrl comprimido no state (em vez do original)
5. Manter o `imageFile` original para referência do nome

```text
Fluxo:
File → FileReader → Image() → check dimensions
  ├─ Se <= 2000×4000: usar original (sem compressão)
  └─ Se > 2000×4000: canvas resize → toDataURL JPEG 0.85 → usar comprimido
```

### Detalhes técnicos
- Função utilitária `compressImage(dataUrl, maxW, maxH, quality): Promise<string>` dentro do próprio arquivo ou em `src/lib/utils.ts`
- Preserva aspect ratio ao redimensionar
- Toast informativo quando compressão é aplicada: "Imagem otimizada automaticamente"
- A resolução reportada (`imageResolution`) continua mostrando a resolução **original** (para o badge HD/Baixa)

### Arquivo afetado
- **`src/pages/Customize.tsx`** — adicionar função de compressão e integrar no `handleImageUpload`

