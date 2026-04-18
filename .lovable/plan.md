
## Recompactar imagens ai-showcase para 252x252

### Análise

As imagens `ai-showcase-1-sm.webp` até `ai-showcase-5-sm.webp` são usadas no carrossel marquee do `AiCoinsSection` como fallback (quando não há gerações públicas). No código:

```tsx
className="flex-shrink-0 w-36 sm:w-40 md:w-44 ..."
width={176} height={176}
```

Tamanho máximo de exibição: **176px CSS** (w-44 = 11rem = 176px). Em telas 2x densidade = **352px reais** — exatamente o tamanho atual. Em telas 1x = 176px.

### Problema com a proposta

Reduzir para **252x252** prejudicaria a nitidez em displays Retina/2x (que renderizariam 252px num espaço que pede 352px = upscale visível e borrado). O ganho de ~30KB não compensa a degradação visual perceptível em mobile (onde quase todos os dispositivos são 2x/3x).

### Alternativas mais seguras

1. **Manter 352x352 e apenas recomprimir** com qualidade WebP 70-75 (atual provavelmente está em 85-90). Economia estimada de 20-30KB **sem perda de resolução**.
2. **Reduzir para 320x320** (cobre ~1.8x density, aceitável para imagens decorativas pequenas). Economia ~15-20KB, perda de nitidez mínima.
3. **Não fazer nada**: essas imagens só carregam quando NÃO há gerações públicas (fallback), e atualmente o site tem gerações públicas → o marquee nem aparece em produção.

### Verificação necessária

Antes de qualquer ação, preciso confirmar:
- Se o fallback é realmente acionado em produção (provavelmente não, pois a tabela `public_ai_generations` tem dados).
- Qualidade atual de compressão dos arquivos.

### Plano proposto

**Pular esta otimização.** Justificativa:
1. As imagens são fallback raramente exibido (há gerações públicas ativas).
2. Reduzir para 252px degradaria visivelmente em telas Retina.
3. O ganho de 30KB em recursos que não carregam na maioria dos pageviews tem ROI baixíssimo.

**Recomendação alternativa**: se quiser ganho garantido, recomprimir os 5 arquivos mantendo 352x352 mas com qualidade WebP 72 (similar ao que fizemos no `hero-bg-optimized.webp`). Isso requer reupload manual dos arquivos otimizados em `/public/lovable-uploads/` — posso fazer isso via script no modo default.

### Decisão pendente

Qual caminho prefere?
- **A)** Pular (recomendado — fallback raramente usado)
- **B)** Recomprimir mantendo 352x352 com qualidade 72 (~20KB ganho, zero perda visual)
- **C)** Reduzir para 320x320 com qualidade 75 (~25KB ganho, perda mínima em 2x)
- **D)** Seguir a proposta original 252x252 (~30KB ganho, perda visível em Retina)
