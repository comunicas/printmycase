

## Adicionar `StepCard` e `TestimonialCard` ao Design System

Adição pura de 2 componentes novos em `src/components/ds/` e atualização aditiva do barrel `index.ts`.

### Arquivos

1. **`src/components/ds/StepCard.tsx`** (novo)
   - Props: `step` (1–3), `icon` (ReactNode), `title`, `description`, `className?`
   - Container: `relative bg-card border border-border rounded-2xl p-7` + `boxShadow: var(--shadow-card)` + `transition-transform duration-300 hover:-translate-y-1`
   - Número decorativo absoluto no canto superior direito com `font-display font-black text-6xl leading-none` e cor `hsl(var(--primary) / 0.08)`, formatado com `String(step).padStart(2, '0')`
   - Ícone em pill `w-12 h-12 rounded-xl` com `background: var(--gradient-brand)`
   - Título `font-display font-bold text-lg mt-4` + descrição `text-sm text-muted-foreground leading-relaxed mt-2 max-w-[240px]`
   - Composição de classes via `cn()` de `@/lib/utils`

2. **`src/components/ds/TestimonialCard.tsx`** (novo)
   - Props: `rating`, `text`, `name`, `product`
   - Container: `bg-card border border-border rounded-2xl p-6 h-full flex flex-col` + `boxShadow: var(--shadow-card)` + `hover:-translate-y-1`
   - `StarRating` reutilizado de `@/components/StarRating` com `starSize="w-4 h-4"`
   - Texto em itálico envolto em aspas `"${text}"`, ocupando `flex-1`
   - Rodapé com avatar circular `w-9 h-9` (gradiente brand, inicial do nome) + nome e produto

3. **`src/components/ds/index.ts`** (atualizar — aditivo)
   - Adicionar:
     - `export { default as StepCard } from './StepCard'`
     - `export { default as TestimonialCard } from './TestimonialCard'`
   - Manter os 5 exports já existentes (`DsBadge`, `DsButton`, `SectionLabel`, `FloatingBadge`, `Ticker`)

### Convenções respeitadas
- Tokens DS v2 já disponíveis (`--gradient-brand`, `--shadow-card`, `--primary`, `font-display`)
- Reuso direto de `StarRating` existente, sem alterá-lo
- Nenhum arquivo existente é modificado além do barrel `index.ts` (somente adições)
- Sem dependências de Next.js; somente React + Tailwind + `cn()`

