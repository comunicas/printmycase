

## Otimização de Imagens — Front-end e SEO

### Diagnóstico

| Problema | Impacto | Onde |
|----------|---------|-----|
| **Logo do header é PNG** (`logo-printmycase.png`) | LCP penalizado — PNG é ~3-5x maior que WebP para logos | `AppHeader.tsx` |
| **Assets originais não-otimizados no repositório** | `hero-bg.jpg` (original), `hero-bg.png`, `hero-bg.webp`, `printmycase-hero.png`, `printmycase-hero.webp`, `logo-epson.png`, `logo-precisioncore.png` — ocupam espaço e podem ser importados por engano | `src/assets/` |
| **Imagens da galeria de inspiração sem `width`/`height`** | CLS (Cumulative Layout Shift) — browser não reserva espaço | `PublicGallerySection.tsx` |
| **Design cards da landing sem `width`/`height`** | CLS nos cards de coleção | `Landing.tsx` (grid de designs) |
| **Showcase AI images duplicadas no DOM** (marquee `[...arr, ...arr]`) | 10 `<img>` tags em vez de 5 — dobra downloads | `AiCoinsSection.tsx` |
| **Galeria pública sem fallback visual para imagens faltantes** | Se `public_image_url` for null e `image_url` expirou, renderiza img quebrada | `PublicGallerySection.tsx` |

### Plano de Correções

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `AppHeader.tsx` | Trocar `logo-printmycase.png` → `logo-printmycase-sm.webp` (já existe em `src/assets/`) via import estático, eliminando o PNG |
| 2 | `PublicGallerySection.tsx` | Adicionar `width={400}` e `height={400}` nas `<img>`. Adicionar `onError` handler para esconder imagens quebradas |
| 3 | `Landing.tsx` | Nos design cards, garantir que `<img>` tenha `width` e `height` explícitos (já tem `300x300`, ok). Confirmar hero bg tem `width`/`height` |
| 4 | `AiCoinsSection.tsx` | Manter a duplicação (necessária para marquee contínuo) mas adicionar `loading="eager"` apenas nos primeiros 5 e `loading="lazy"` nos clones |
| 5 | Deletar assets não-usados | Remover `hero-bg.jpg`, `hero-bg.png`, `hero-bg.webp`, `printmycase-hero.png`, `printmycase-hero.webp`, `logo-epson.png`, `logo-precisioncore.png` — mantendo apenas os `.webp` otimizados em uso |

### Detalhes Técnicos

**Logo WebP** — O arquivo `logo-printmycase-sm.webp` já existe no projeto. Basta importar como módulo ES e usar como `src`.

**CLS fix na galeria** — Adicionar dimensões explícitas + `object-cover` garante que o browser reserve espaço antes do download.

**Imagens quebradas** — `onError={(e) => (e.currentTarget.style.display = 'none')}` impede que imagens com URL expirada mostrem ícone quebrado.

**Limpeza de assets** — Os 7 arquivos não-otimizados somam ~5-15MB no repositório. Removê-los reduz o bundle size e evita uso acidental.

