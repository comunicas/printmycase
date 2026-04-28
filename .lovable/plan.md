# Auditoria e plano de otimização de imagens

## Diagnóstico

### ✅ O que já está bem
- **Helper `getOptimizedUrl`** (`src/lib/image-utils.ts`) usa o endpoint `render/image/public` do Supabase para gerar variantes redimensionadas em WebP — em uso em `BrandPage`, `CollectionCard`, `ProductGallery`, `AiCoinsSection`, `AiGalleryModal`, `HeroPhoneCarousel` e na seção "Coleções em Destaque" da Landing.
- **Logo do header** servido como WebP otimizado (`/logo-printmycase-sm.webp`) com `fetchPriority="high"` (memória LCP já documentada).
- A maioria dos `<img>` em listagens já tem `loading="lazy"` + `width`/`height` explícitos.

### ❌ Problemas encontrados

1. **`public/images/tech-quality-case-new.png` = 1.247 KB** (PNG não otimizado).
   Usado na seção "Impressão" da home (`TechQualitySection`). Substitui um WebP de 54 KB que existia antes (`tech-quality-case.webp`). Impacto direto no LCP/CLS da home em scroll.

2. **`ProductCard`** (usado no `Catalog` e em buscas) usa `product.device_image` diretamente — **sem `getOptimizedUrl`**, baixando a imagem original do Supabase Storage (pode ser >500 KB) para um thumb de 300×300.

3. **`Collections.tsx` (linha 117)** — grid de designs usa `design.image_url` cru, sem `getOptimizedUrl`, em até 12 cards por página.

4. **`CollectionPage.tsx` (linha 128)** — mesma situação: 4 colunas × N designs renderizados sem otimização.

5. **`SelectModel.tsx` (linha 191)** — thumbs de modelos usam `thumb` cru, sem otimização (até 20+ itens visíveis).

6. **`ModelSelector.tsx`** — listagem do dropdown (linha 235) e botão (linha 137) usam URLs originais para thumbs de 28–36 px.

7. **`AiFiltersList.tsx` (linha 84)** — thumbs dos filtros de IA usam `filter.style_image_url` cru. Não há `loading="lazy"`, `width`/`height` nem otimização. Em customização há ~20 filtros visíveis.

8. **`FilterConfirmDialog.tsx` (linha 57)** — preview do filtro sem otimização nem `loading="lazy"`.

9. **`MobileTabOverlay.tsx` (linha 155)** — sem otimização verificada.

10. **`HeroPhoneCarousel`** já usa `getOptimizedUrl(560)`, mas as duas imagens iniciais carregam com `loading="eager"` (correto para LCP). Sem mudança aqui.

---

## Plano em etapas

### Etapa 1 — Corrigir imagem pesada da seção "Impressão" (impacto imediato)

**Ação**: Voltar a referenciar a versão WebP otimizada e remover o PNG de 1,2 MB.

- Em `src/components/home/TechQualitySection.tsx` linha 42, trocar:
  - De: `src="/images/tech-quality-case-new.png"`
  - Para: `src="/tech-quality-case.webp"` (que já existe e tem 54 KB)
- Adicionar `width`/`height` explícitos no `<img>` para evitar CLS.
- Excluir os arquivos `public/images/tech-quality-case-new.png` (1,2 MB) e `public/tech-quality-case.png` (555 KB) — não são mais referenciados.

> Observação: a imagem nova (mão segurando capa amarela "CIMED") foi enviada como PNG e ficou pesada. Mantendo o asset original do projeto (capa graffiti). Se você quiser **manter a nova imagem da CIMED**, eu também converto para WebP otimizado (~60–80 KB) e atualizo a referência.

### Etapa 2 — Padronizar uso do `getOptimizedUrl` em todas as listagens

Aplicar o helper nos componentes que ainda baixam o original:

| Arquivo | Linha | Uso atual | Otimização sugerida |
|---|---|---|---|
| `src/components/ProductCard.tsx` | 24 | `product.device_image` | `getOptimizedUrl(..., 320)` |
| `src/pages/Collections.tsx` | 118 | `design.image_url` | `getOptimizedUrl(..., 320)` |
| `src/pages/CollectionPage.tsx` | 129 | `design.image_url` | `getOptimizedUrl(..., 320)` |
| `src/pages/SelectModel.tsx` | 192 | `thumb` | `getOptimizedUrl(..., 240)` |
| `src/components/customize/ModelSelector.tsx` | 138, 236 | `productImage` / `thumb` | `getOptimizedUrl(..., 80)` (são thumbs minúsculos) |
| `src/components/customize/AiFiltersList.tsx` | 84 | `filter.style_image_url` | `getOptimizedUrl(..., 160)` + `loading="lazy"` + `width/height` |
| `src/components/customize/FilterConfirmDialog.tsx` | 57 | imagem do preview | `getOptimizedUrl(..., 400)` + `loading="lazy"` |
| `src/components/customize/MobileTabOverlay.tsx` | 155 | thumb | `getOptimizedUrl` apropriado |

### Etapa 3 — Atributos HTML obrigatórios em todo `<img>`

Garantir em **todo** `<img>` de listagem:
- `loading="lazy"` (exceto LCP/herói)
- `decoding="async"`
- `width` e `height` numéricos (evita CLS)
- `alt` descritivo (já está OK na maior parte)

Pontos sem `loading="lazy"` hoje: `AiFiltersList`, `FilterConfirmDialog`, `ModelSelector` (linha 137 — botão sempre visível, OK manter eager), `Collections` (já tem), `ProductCard` (já tem).

### Etapa 4 — `srcset` responsivo nos cards de produto/design

Para cards que ocupam tamanhos diferentes em mobile vs desktop (1 col mobile vs 4 col desktop), adicionar variantes:
```tsx
srcSet={`${getOptimizedUrl(url, 200)} 200w, ${getOptimizedUrl(url, 400)} 400w, ${getOptimizedUrl(url, 600)} 600w`}
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
```
Aplicar em `ProductCard`, `CollectionPage`, `Collections` (grid principal e Landing destaque) e `BrandPage`.

### Etapa 5 — Documentação/memória

Atualizar `mem://performance/image-optimization` com a regra: **toda imagem servida do Supabase Storage em listagem DEVE passar por `getOptimizedUrl` com tamanho proporcional ao slot renderizado**. Nada de PNG cru em `/public/`.

---

## Resultado esperado

- Seção "Impressão" volta a ~54 KB (de 1,2 MB) — economia imediata de >1 MB no scroll inicial.
- Listagens (`/catalog`, `/colecoes`, `/colecao/:slug`, `/customize`, dropdown de modelos, filtros IA) passam a baixar variantes 200–400 px em WebP em vez de originais (geralmente >500 KB cada).
- Em uma página de catálogo com 12 cards, a economia estimada é de ~5–8 MB no carregamento inicial.
- CLS reduzido por presença consistente de `width`/`height`.

Quer que eu prossiga com **todas** as 5 etapas, ou prefere começar só pela Etapa 1 + 2 (impacto maior, mudanças mais seguras)?