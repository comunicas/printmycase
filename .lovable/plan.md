

## Otimizar imagens ai-showcase (1-5)

As 5 imagens `ai-showcase-{1-5}-sm.webp` estão em 1024x1024px mas são exibidas em no maximo 176x176px, resultando em ~6MB desperdicados.

### Plano

1. Usar um script com `sharp` (ou `magick`/`vipsthumbnail` se disponivel) para redimensionar cada imagem de 1024x1024 para 352x352px (2x para retina) com compressao WebP quality 80
2. Sobrescrever os arquivos originais em `public/lovable-uploads/`
3. Verificar o tamanho resultante (esperado: ~15-30KB cada vs ~1MB atual)

Arquivos afetados:
- `public/lovable-uploads/ai-showcase-1-sm.webp`
- `public/lovable-uploads/ai-showcase-2-sm.webp`
- `public/lovable-uploads/ai-showcase-3-sm.webp`
- `public/lovable-uploads/ai-showcase-4-sm.webp`
- `public/lovable-uploads/ai-showcase-5-sm.webp`

Nenhuma alteracao de codigo necessaria — os caminhos permanecem os mesmos.

**Economia estimada: ~5-6MB no carregamento da landing page.**

