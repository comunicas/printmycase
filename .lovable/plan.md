

## Otimizar hero-bg-optimized.webp

A imagem de fundo do hero (`src/assets/hero-bg-optimized.webp`) tem 1.4MB e é usada como background cover em uma seção full-screen.

### Plano

1. Redimensionar a imagem para **1920px de largura** (mantendo aspect ratio) — suficiente para telas comuns e retina de laptops
2. Comprimir com WebP quality **75** (background com overlay escuro tolera mais compressão)
3. Sobrescrever `src/assets/hero-bg-optimized.webp`

**Economia estimada**: de ~1.4MB para ~100-200KB.

Nenhuma alteração de código necessária — o import existente permanece o mesmo.

