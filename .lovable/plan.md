

## Otimização de Imagens Públicas na Galeria

### Diagnóstico

Não existe rotina de otimização nas imagens da galeria pública. O fluxo atual:

```text
fal.ai output (ex: 1280x2272 jpg, ~500KB-2MB)
  → armazenado em customizations/ (tamanho original)
  → copiado 1:1 para product-assets/galleries/public/ (sem resize)
  → servido na landing page em cards de ~200-400px
```

O resultado é que imagens de até 2MB são servidas para exibição em cards de 200px. Não há nenhuma compressão, redimensionamento ou conversão para WebP no pipeline de publicação.

### Plano de Correção

| # | Onde | O que |
|---|------|-------|
| 1 | `UserGenerationsManager.tsx` — `copyToPublicBucket` | Após o download do bucket privado, redimensionar a imagem para max 800x800 e converter para WebP (quality 0.80) usando canvas no browser antes de fazer upload para o bucket público. Isso reduz ~80% do peso. |
| 2 | `AiCoinsSection.tsx` | Adicionar `decoding="async"` e `fetchpriority="low"` nas imagens da galeria para não competir com o LCP. |

### Detalhes Técnicos — Passo 1

Na função `copyToPublicBucket`, após o `download()`, criar um pipeline de otimização:

```text
blob do bucket privado
  → createImageBitmap(blob)
  → canvas.drawImage (max 800x800, mantendo aspect ratio)
  → canvas.toBlob("image/webp", 0.80)
  → upload para product-assets/galleries/public/{id}.webp
```

Isso garante que toda imagem publicada passe por otimização automática, sem depender de ação manual.

### Impacto Estimado

- Imagem típica de filtro (640x1136 jpg): ~300KB → ~60KB webp 800px
- Imagem típica de upscale (1280x2272 jpg): ~1.5MB → ~80KB webp 800px
- Melhoria no LCP da landing page: significativa (menos bytes no viewport)

