
## Auditoria de /public/ (raiz)

### Inventário

| Arquivo | Tamanho | Detalhes | Uso | Status |
|---|---|---|---|---|
| `favicon.ico` | 56 KB | PNG único 256x256 dentro de .ico | Browser auto | 🟡 Superdimensionado |
| `logo-printmycase-sm.webp` | 4 KB | WebP otimizado | LCP preload, header, footer, intro, success | ✅ OK |
| `placeholder.svg` | 3.2 KB | SVG vetor | ProductGallery, Customize fallback | ✅ OK |
| `llms.txt` | 1.4 KB | AEO/AI crawlers | Texto | ✅ OK |
| `robots.txt` | 0.4 KB | SEO | Texto | ✅ OK |
| `googledc7e349a7903758f.html` | 53 B | Search Console verification | Google | ✅ OK |
| `lovable-uploads/` | — | Já auditado anteriormente | — | ✅ OK |

### Único achado: `favicon.ico` (56 KB)

Hoje é um **único PNG 256x256 embalado como .ico** — pesado e ineficiente. Favicons modernos devem ter múltiplas resoluções pequenas (16, 32, 48) e idealmente um SVG separado para alta densidade.

**Tamanho típico de favicon bem otimizado**: 5–15 KB. Atual 56 KB representa ~40 KB desperdiçados em **todo pageview** (favicon é solicitado em quase todas as navegações).

### Plano de ação (1 mudança)

**Recompactar `favicon.ico` em multi-resolução (16, 32, 48)**:
- Gerar a partir do logo atual (`logo-printmycase-sm.webp`) usando ImageMagick
- Saída: `.ico` com 3 frames PNG (16x16, 32x32, 48x48)
- Tamanho esperado: ~5–10 KB
- Ganho: **~46 KB economizados em cada pageview** (favicon é cacheado mas custa no primeiro load e em cold cache)

**Sem alterações em HTML/código** — o caminho `/favicon.ico` é o padrão e continua funcionando.

### Riscos

- Mínimo. Favicon multi-res é universalmente suportado (IE6+, todos browsers modernos).
- Visualmente idêntico em todos contextos de exibição (tab, bookmarks, atalhos).

### Não recomendado tocar

- `placeholder.svg` (3.2 KB) — vetor já mínimo e usado em fallback.
- `logo-printmycase-sm.webp` — já é o LCP otimizado (constraint conhecida em memória).
- Arquivos texto (`robots.txt`, `llms.txt`, `googledc...html`) — todos sub-2 KB.

### Decisão

Aprove para executar a recompressão do favicon no modo default. Único arquivo afetado: `public/favicon.ico`.
