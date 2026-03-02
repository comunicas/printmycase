

# Code Review e Refatoracao - Case Studio

## Problemas Encontrados

### 1. Legado Vite Boilerplate
- **`src/App.css`**: Arquivo inteiro e legado do template Vite (estilos `.logo`, `.card`, `.read-the-docs`, animacao `logo-spin`). Nao e importado por nenhum arquivo da aplicacao.

### 2. Conflito e Excesso de Fontes (`src/index.css`)
- Importa **7 fontes do Google Fonts** (Inter, Montserrat, Cormorant Garamond, IBM Plex Mono, Poppins, Merriweather, JetBrains Mono) -- apenas Inter e usada.
- Conflito: `--font-sans` aponta para Poppins, mas o `body` sobrescreve com `font-family: 'Inter'`. Resultado: a variavel CSS e ignorada.

### 3. 40+ Componentes UI Nao Utilizados
Componentes shadcn/ui instalados mas **nunca importados** pelo codigo da aplicacao (apenas referenciados internamente entre si):
- accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, calendar, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, sheet, sidebar, skeleton, sonner, switch, textarea, toggle, toggle-group

**Componentes efetivamente usados**: button, card, separator, slider, tabs, table, toast, toaster, tooltip

### 4. 15+ Dependencias npm Nao Utilizadas
Pacotes no `package.json` nunca importados pelo codigo da aplicacao:
- `@tanstack/react-query`, `sonner`, `next-themes`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`, `embla-carousel-react`, `input-otp`, `cmdk`, `react-resizable-panels`, `vaul`, `react-day-picker`
- Multiplos pacotes Radix usados apenas por componentes UI nao utilizados

### 5. Hook `use-mobile.tsx` Orfao
- Usado apenas por `sidebar.tsx`, que nao e usado pela aplicacao.

### 6. Re-export Desnecessario
- `src/components/ui/use-toast.ts` apenas re-exporta `src/hooks/use-toast.ts`. Pode ser eliminado se os imports forem ajustados.

### 7. Pagina 404 em Ingles
- `NotFound.tsx`: "Oops! Page not found" e "Return to Home" -- inconsistente com o resto em portugues.

### 8. URL Hardcoded no SeoHead
- `SeoHead.tsx` usa `https://case-studio-pro-03.lovable.app` como URL fixa. Deveria usar a URL publicada real ou `window.location.origin`.

### 9. Codigo Duplicado: Star Rating
- A logica de renderizar estrelas (fullStars, hasHalf, loop de 5 Star icons) e copiada identicamente em 3 arquivos: `Landing.tsx`, `Catalog.tsx`, `ProductInfo.tsx`.

### 10. Codigo Duplicado: Product Card
- O card de produto (imagem + nome + preco + estrelas) e duplicado entre `Landing.tsx` e `Catalog.tsx` com markup quase identico.

---

## Plano de Refatoracao

### A. Deletar Legado
- **Deletar `src/App.css`** (boilerplate Vite nao utilizado)
- **Deletar componentes UI nao utilizados** (40 arquivos em `src/components/ui/`)
- **Deletar `src/hooks/use-mobile.tsx`** (orfao)
- **Deletar `src/components/ui/use-toast.ts`** (re-export redundante) e atualizar imports em `Customize.tsx` para usar `@/hooks/use-toast` diretamente

### B. Limpar Fontes (`src/index.css`)
- Remover imports de fontes nao usadas (Montserrat, Cormorant Garamond, IBM Plex Mono, Poppins, Merriweather, JetBrains Mono)
- Manter apenas Inter
- Alinhar `--font-sans` com Inter e remover a linha duplicada de `font-family` no body

### C. Remover Dependencias nao Utilizadas (`package.json`)
- Remover: `@tanstack/react-query`, `sonner`, `next-themes`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`, `embla-carousel-react`, `input-otp`, `cmdk`, `react-resizable-panels`, `vaul`, `react-day-picker`
- Remover pacotes Radix usados apenas por componentes deletados: accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, sheet, switch, toggle, toggle-group

### D. Extrair Componentes Reutilizaveis
- **Criar `src/components/StarRating.tsx`**: componente que recebe `rating` e `reviewCount` (opcional) e renderiza as estrelas. Substituir nos 3 arquivos.
- **Criar `src/components/ProductCard.tsx`**: componente que recebe um `Product` e renderiza o card clicavel com imagem, nome, preco e estrelas. Substituir em `Landing.tsx` e `Catalog.tsx`.

### E. Traduzir NotFound para Portugues (`src/pages/NotFound.tsx`)
- "Page not found" -> "Pagina nao encontrada"
- "Return to Home" -> "Voltar ao Inicio"

### F. Corrigir SeoHead (`src/components/SeoHead.tsx`)
- Substituir URL hardcoded por `window.location.origin` para funcionar em qualquer dominio

### G. Criar Documentacao Estrutural (`ARCHITECTURE.md`)
Documentar a estrutura atual do projeto:

```text
ARCHITECTURE.md
- Visao geral do projeto
- Stack tecnologica (React, Tailwind, Radix UI subset, Vite)
- Hierarquia de URLs e jornada do usuario
- Estrutura de pastas
- Componentes da aplicacao (AppHeader, PhonePreview, ControlPanel, etc.)
- Componentes UI base (shadcn subset: button, card, separator, slider, tabs, table, toast, tooltip)
- Modelo de dados (products.ts)
- SEO e dados estruturados
- Convencoes de codigo
```

---

## Arquivos a Criar
1. `src/components/StarRating.tsx`
2. `src/components/ProductCard.tsx`
3. `ARCHITECTURE.md`

## Arquivos a Modificar
4. `src/index.css` -- limpar fontes
5. `src/pages/Landing.tsx` -- usar ProductCard e StarRating
6. `src/pages/Catalog.tsx` -- usar ProductCard
7. `src/components/ProductInfo.tsx` -- usar StarRating
8. `src/pages/NotFound.tsx` -- traduzir para portugues
9. `src/components/SeoHead.tsx` -- URL dinamica
10. `src/pages/Customize.tsx` -- ajustar import de useToast
11. `package.json` -- remover dependencias nao utilizadas

## Arquivos a Deletar
12. `src/App.css`
13. `src/hooks/use-mobile.tsx`
14. `src/components/ui/use-toast.ts`
15. ~40 componentes UI nao utilizados em `src/components/ui/`

