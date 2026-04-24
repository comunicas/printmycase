

## Adicionar tokens do Design System v2 e novas fontes

Alterações puramente aditivas em 3 arquivos. Nenhum token, classe, componente ou página existente será removido ou modificado.

### 1) `src/index.css`

**No bloco `:root`**, após `--spacing: 0.25rem;`, adicionar:
- Gradientes: `--gradient-brand`, `--gradient-glow`, `--gradient-surface`
- Sombras DS v2 (nomes novos, não conflitam com os existentes): `--shadow-card`, `--shadow-elevated`, `--shadow-glow`
- Superfícies: `--surface-1`, `--surface-2`, `--surface-3`

**No bloco `.dark`**, após o último token, adicionar:
- `--gradient-brand` (variação dark)
- `--surface-1`, `--surface-2`, `--surface-3` (variações dark)

**No final do arquivo**, após o último `@keyframes toast-progress`, adicionar:
- `@keyframes ticker` (translateX 0 → -50%)

### 2) `tailwind.config.ts`

**Em `theme.extend.fontFamily`**, manter `sans` intacto e adicionar:
- `display`: Outfit + fallbacks
- `body`: Nunito + fallbacks

**Em `theme.extend.boxShadow`**, manter as 7 chaves existentes (`2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`) e adicionar:
- `card`: `var(--shadow-card)`
- `elevated`: `var(--shadow-elevated)`
- `glow`: `var(--shadow-glow)`

### 3) `index.html`

Sem duplicar os `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com` (já existem).

Logo abaixo do `<link rel="preload" as="style" ...Inter...>` existente, adicionar:
- `<link rel="preload" as="style" href="...Outfit:wght@700;800;900&family=Nunito:wght@400;500;600;700..." onload="this.onload=null;this.rel='stylesheet'" />`
- `<noscript><link rel="stylesheet" href="...Outfit+Nunito..." /></noscript>` correspondente

### Garantias
- Nenhum token existente é removido ou alterado
- Nomes dos novos tokens de sombra (`card`, `elevated`, `glow`) não colidem com os existentes
- Nenhum componente ou página é tocado nesta etapa
- Tailwind passa a expor as utilities `font-display`, `font-body`, `shadow-card`, `shadow-elevated`, `shadow-glow` para uso futuro

