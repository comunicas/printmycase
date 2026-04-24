

## Criar primitivos do Design System em `src/components/ds/`

Adição pura de 6 arquivos novos. Nenhum arquivo existente será tocado.

### Arquivos a criar

1. **`src/components/ds/DsBadge.tsx`**
   - Variantes: `brand`, `discount`, `new`, `top`, `outline`, `muted` (default: `brand`)
   - Base: `rounded-full text-xs font-semibold px-2.5 py-0.5 inline-flex items-center`
   - Composição via `cn()` de `@/lib/utils`

2. **`src/components/ds/DsButton.tsx`**
   - Variantes: `brand`, `default`, `outline`, `ghost` (default: `default`)
   - Tamanhos: `sm`, `md`, `lg` (default: `md`)
   - Props extras: `icon` (renderizado à esquerda com `mr-2`), `arrow` (acrescenta " →"), `href` (renderiza `<Link to={href}>` do `react-router-dom` em vez de `<button>`)
   - Variante `brand` aplica `style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-elevated)' }}` (token DS v2 já adicionado)
   - Quando `href` está presente, repassa `className` mas ignora props nativas de `<button>`

3. **`src/components/ds/SectionLabel.tsx`**
   - Pílula de seção: `rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-widest uppercase px-3 py-1 inline-flex items-center gap-1.5`

4. **`src/components/ds/FloatingBadge.tsx`**
   - Badge flutuante com `icon` (emoji string) + `label`
   - Visual: `bg-card border border-border rounded-full` + `style={{ boxShadow: 'var(--shadow-card)' }}`

5. **`src/components/ds/Ticker.tsx`**
   - Marquee horizontal usando o `@keyframes ticker` (já adicionado ao `index.css`)
   - Container: `w-full overflow-hidden border-y border-border py-2.5` com `style={{ background: 'var(--surface-1)' }}`
   - Track interno em `inline-flex` com `style={{ animation: \`ticker ${speed}s linear infinite\` }}`, default `speed=30`
   - Renderiza os items duplicados (`[...items, ...items]`) para loop contínuo, separados visualmente por `" ✦ "`

6. **`src/components/ds/index.ts`**
   - Re-exports `default` dos 5 componentes acima como named exports

### Convenções respeitadas
- Imports via alias `@/components/...` e `@/lib/utils`
- `cn()` de `@/lib/utils`
- Navegação interna com `Link` do `react-router-dom` (sem `next/link`)
- Sem alterações em arquivos existentes; nenhum componente/página é importado por estes primitivos
- Tokens DS v2 (`--gradient-brand`, `--shadow-elevated`, `--shadow-card`, `--surface-1`, `@keyframes ticker`) já existem no projeto

