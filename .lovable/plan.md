

## Animações de Entrada no Hero

Adicionar animações escalonadas (staggered) de fade-in + slide-up nos elementos do hero da landing page para criar uma entrada progressiva e elegante.

### Abordagem

Usar CSS keyframes já disponíveis no projeto (`fade-in`) combinados com classes de delay customizadas via `style={{ animationDelay }}` para criar o efeito staggered. Cada elemento do hero entra sequencialmente:

1. **Título** (h1) — 0ms delay
2. **Subtítulo** (p) — 150ms
3. **Botões CTA** — 300ms
4. **Badge social proof** — 450ms

Todos começam com `opacity-0` e usam `animate-fade-in` com `animation-fill-mode: forwards`.

### Alterações

**`src/pages/Landing.tsx`** — Adicionar classes de animação nos 4 elementos do hero content:
- `opacity-0 animate-fade-in` + `style={{ animationDelay: "Xms", animationFillMode: "forwards" }}`

**`tailwind.config.ts`** — O keyframe `fade-in` já inclui `translateY(10px)→0`, que dá o efeito slide-up naturalmente. Nenhuma alteração necessária no config.

Alteração em um único arquivo, sem dependências extras.

