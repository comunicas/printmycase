
## Verificar otimização de `hero-bg-optimized.webp`

### Inspeção necessária (read-only)

1. `code--exec` (em modo default) com `identify` ou `webpinfo` / `ffprobe` em `src/assets/hero-bg-optimized.webp` para extrair:
   - Dimensões reais (largura × altura)
   - Tamanho do arquivo (KB)
   - Qualidade/método de compressão WebP

### Critérios de avaliação

| Métrica | Ideal | Ação se fora |
|---|---|---|
| Largura | ≤ 1920px | Redimensionar |
| Altura | ≤ 1080px | Redimensionar |
| Qualidade | q=75-80 | Recomprimir |
| Tamanho | < 200 KB | Recomprimir |

### Plano de ação

**Fase 1 — Inspecionar** (read-only)
- Rodar `identify -format "%w %h %b\n" src/assets/hero-bg-optimized.webp` (ImageMagick via nix)
- Comparar contra critérios acima

**Fase 2 — Otimizar (somente se necessário)**
- Se largura > 1920 ou altura > 1080: redimensionar com `cwebp -resize 1920 0` mantendo aspect ratio
- Se tamanho > 200 KB: recomprimir com `cwebp -q 78 -m 6` (método 6 = melhor compressão)
- Salvar em `src/assets/hero-bg-optimized.webp` (overwrite)
- Validar visualmente abrindo o novo arquivo

**Fase 3 — Validar**
- Confirmar que `Landing.tsx` continua renderizando o hero corretamente
- Verificar LCP no preview

### Saída esperada

- Se já está otimizado: relatório confirmando "tudo OK, nenhuma ação necessária"
- Se precisa otimizar: arquivo recomprimido + relatório antes/depois (KB economizados)

### Risco

Baixo. WebP é overwrite atômico; se algo der errado, basta restaurar do git.
