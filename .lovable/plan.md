

## Add Hover Animations to Product Cards and Testimonial Cards

### Current State

- **Benefits cards**: Already have `hover:shadow-lg hover:-translate-y-1 transition-all duration-300` and `group-hover:scale-110` on icon. Working correctly.
- **"Como Funciona" connectors**: Already implemented with dashed lines and ChevronRight between steps on desktop. Working correctly.
- **Product cards** (`ProductCard.tsx`): Only have `transition-shadow hover:shadow-md` — no lift or scale effect.
- **Testimonial cards** (`Landing.tsx` line 211): Plain `border-0 shadow-sm` with no hover effects at all.

### Changes

**1. `src/components/ProductCard.tsx`** — Enhance hover:
- Change card class from `transition-shadow hover:shadow-md` to `group transition-all duration-300 hover:shadow-lg hover:-translate-y-1`
- Add `group-hover:scale-105 transition-transform duration-300` to the image for a subtle zoom on hover

**2. `src/pages/Landing.tsx`** (line 211) — Add hover to testimonial cards:
- Change from `border-0 shadow-sm h-full` to `border-0 shadow-sm h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300`

Two files, minimal class additions only.

