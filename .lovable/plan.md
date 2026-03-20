

## Layout Side-by-Side Desktop — Página de Customização

### Alterações

**1. `src/pages/Customize.tsx`**
- `<main>`: adicionar `lg:flex-row` para side-by-side no desktop
- Lado esquerdo: PhonePreview centralizado (`lg:w-1/2 lg:items-center lg:justify-center`)
- Lado direito: `<aside className="hidden lg:flex flex-col ...">`  com título "Personalize sua Case", ImageControls e ContinueBar inline
- Mobile ImageControls permanece dentro do main (visível apenas mobile via `lg:hidden`)
- Mobile ContinueBar permanece fora do main (como já está com `lg:hidden`)

**2. `src/components/PhonePreview.tsx`**
- Trocar `lg:w-[260px] lg:h-[532px] lg:aspect-auto` por `lg:h-[70vh] lg:w-auto lg:aspect-[260/532]`
- Manter aspect-ratio via CSS, altura flexível no desktop

**3. `src/components/customize/ContinueBar.tsx`**
- Adicionar prop `inline?: boolean`
- Quando `inline`, renderizar apenas os botões sem wrapper fixo (sem border-t, sem backdrop)
- Desktop standalone (hidden lg:flex) já existente permanece para o aside

**4. `src/components/customize/ImageControls.tsx`**
- Adicionar `lg:max-w-none` para ocupar largura total do painel lateral no desktop

### Arquivos alterados
1. `src/pages/Customize.tsx` — layout flex-row desktop + aside
2. `src/components/PhonePreview.tsx` — sizing flexível
3. `src/components/customize/ContinueBar.tsx` — modo inline
4. `src/components/customize/ImageControls.tsx` — remover max-width desktop

