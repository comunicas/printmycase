

## Plano: Ajustes Mobile — Header, Hero e PhonePreview sem corte

### Problema Principal
No screenshot da customização mobile (image-50), o smartphone mockup está sendo cortado na parte inferior. O layout `h-dvh` com header + preview + tabs + controls + bottom bar não cabe em viewports pequenos.

### 1. PhonePreview — Tamanho responsivo que não corta

**`src/components/PhonePreview.tsx`** (linha 194):
- Atual: `w-[220px] h-[450px]` fixo em mobile
- Proposto: Reduzir para `w-[200px] h-[410px]` em mobile, mantendo `lg:w-[260px] lg:h-[532px]`
- Ajustar border-radius proporcionalmente: `rounded-[2.2rem]` mobile

Isso garante que o mockup inteiro caiba no viewport sem ser cortado pelo bottom bar.

### 2. Customize Page — Layout flex mais compacto

**`src/pages/Customize.tsx`** (linha ~350):
- Reduzir `gap-3` do main para `gap-2` em mobile: `gap-2 lg:gap-3`
- O `PhonePreview` internamente já tem `gap-2 lg:gap-3` (linha 192) — ok

### 3. Header da Customização — Mais compacto

**`src/components/customize/CustomizeHeader.tsx`**:
- Reduzir padding: `px-3 py-1.5` (de `px-3 py-2`)
- Reduzir botão back: `h-8 w-8` (de `h-9 w-9`)
- Texto do produto: manter `text-sm`

### 4. ContinueBar — Padding mais enxuto em mobile

**`src/components/customize/ContinueBar.tsx`**:
- Reduzir padding interno: `px-3 py-2` (de `px-4 py-3`)

### 5. AppHeader Landing — Confirmação

Header já está com `h-7 sm:h-8`, `px-3 py-2 sm:px-5 sm:py-3`, "Ver Modelos" hidden em mobile. Está ok conforme screenshots.

### Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/PhonePreview.tsx` | Reduzir dimensões mobile do mockup |
| `src/pages/Customize.tsx` | Reduzir gap do main em mobile |
| `src/components/customize/CustomizeHeader.tsx` | Padding e botão mais compactos |
| `src/components/customize/ContinueBar.tsx` | Padding mobile reduzido |

