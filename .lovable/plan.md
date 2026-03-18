

## Análise de Performance — Oportunidades de Otimização

### Diagnóstico atual

| Recurso | Peso | Problema |
|---------|------|----------|
| `printmycase-hero-optimized.webp` | ~1.15 MB | Background do WhyArtisCase, exibido com overlay 75% escuro — tolera compressão agressiva |
| `stripe-logo.png` | 64 KB | PNG desnecessário, pode ser convertido para WebP ou substituído por SVG inline |
| `logo-artiscase.png` | 55 KB | Logo no footer, PNG — converter para WebP |
| `logo-epson.png` | 30 KB | PNG — converter para WebP |
| `logo-precisioncore.png` | 21 KB | PNG — converter para WebP |
| `79379ce7...png` (logo header) | 55 KB | Preloaded no `index.html`, PNG — converter para WebP |
| `lucide-react` | 158 KB (dev) | Importado em 11+ páginas; em prod o tree-shaking resolve, mas verificar bundle size |
| Landing page não lazy | ~19 KB | Landing é importada diretamente (não lazy), o que é correto para a rota "/" |

### Plano de otimização (5 ações)

**1. Comprimir `printmycase-hero-optimized.webp`**
- Redimensionar para 1920px largura, WebP quality 60 (overlay escuro de 75% esconde artefatos)
- Economia estimada: ~1 MB

**2. Converter logos PNG → WebP**
- `logo-artiscase.png`, `logo-epson.png`, `logo-precisioncore.png` → WebP quality 85
- Atualizar imports em `Landing.tsx` e `WhyArtisCase.tsx`
- Economia estimada: ~60 KB

**3. Converter `stripe-logo.png` → WebP**
- Atualizar referência em `PaymentBadges.tsx`
- Economia estimada: ~40 KB

**4. Converter logo do header (`79379ce7...png`) → WebP**
- Atualizar preload no `index.html`
- Atualizar referência em `AppHeader.tsx`
- Economia estimada: ~30 KB

**5. Adicionar `loading="lazy"` e dimensões explícitas a imagens below-the-fold**
- Logos Epson/PrecisionCore no WhyArtisCase já têm width/height ✓
- Imagens de coleções na Landing: adicionar `width`/`height` explícitos
- Logo do footer: adicionar `width`/`height` explícitos

### Fora do escopo (infraestrutura)
- Cache headers (`Cache-Control`) são definidos pelo hosting, não pelo código
- TTFB de 861ms é do servidor de preview, não reflete produção
- Supabase Storage tem cache fixo de 1h — não configurável via código

### Economia total estimada: ~1.2 MB

Arquivos modificados:
- `src/assets/printmycase-hero-optimized.webp` (recomprimir)
- `src/assets/logo-artiscase.png` → `.webp`
- `src/assets/logo-epson.png` → `.webp`
- `src/assets/logo-precisioncore.png` → `.webp`
- `public/lovable-uploads/stripe-logo.png` → `.webp`
- `public/lovable-uploads/79379ce7...png` → `.webp`
- `src/pages/Landing.tsx` (atualizar imports)
- `src/components/WhyArtisCase.tsx` (atualizar imports)
- `src/components/PaymentBadges.tsx` (atualizar src)
- `src/components/AppHeader.tsx` (atualizar src)
- `index.html` (atualizar preload href)

