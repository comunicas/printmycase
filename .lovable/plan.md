

## Animações de Entrada ao Scroll com Intersection Observer

### Abordagem

Criar um hook `useScrollAnimation` que usa Intersection Observer para adicionar classes de animação quando os elementos entram no viewport. Aplicar nas 4 seções abaixo do hero: Benefícios, Como Funciona, Destaques e Depoimentos.

### Alterações

**1. `src/hooks/useScrollAnimation.ts`** (novo) — Hook customizado:
- Recebe uma ref e opções (threshold, rootMargin)
- Retorna `isVisible` boolean
- Usa `IntersectionObserver` com `triggerOnce` (desconecta após primeira interseção)

**2. `src/components/ScrollReveal.tsx`** (novo) — Componente wrapper:
- Recebe `children`, `delay` (ms), `className`
- Usa o hook internamente
- Aplica `opacity-0 translate-y-6` por padrão, transiciona para `opacity-100 translate-y-0` quando visível
- Usa CSS transitions (não keyframes) para controle mais fino com `transition-delay`

**3. `src/pages/Landing.tsx`** — Envolver os elementos das seções com `<ScrollReveal>`:
- Cada card de benefício com delay escalonado (0, 100, 200ms)
- Cada step do "Como Funciona" com delay escalonado
- Título de cada seção com delay 0
- Cards de produtos e depoimentos com delays escalonados
- O componente `ScrollReveal` por seção para que cada seção anime independentemente ao entrar no viewport

Três arquivos (1 novo hook, 1 novo componente, 1 editado).

