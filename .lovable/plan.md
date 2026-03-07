

## Plano: Ajustes Mobile Header + Refinamento Hero + Limpeza V1

### 1. Header Mobile — Redimensionar Elementos

No screenshot, os elementos do header ficam apertados em mobile. Ajustes:

**`src/components/AppHeader.tsx`**:
- Reduzir logo de `h-8` para `h-7` em mobile
- Reduzir padding do nav de `px-5 py-3` para `px-3 py-2 sm:px-5 sm:py-3`
- Botão "Ver Modelos" — esconder em telas < sm (`hidden sm:inline-flex`)
- Reduzir gap entre itens do lado direito de `gap-2` para `gap-1.5 sm:gap-2`

**`src/components/CoinBalance.tsx`**:
- Reduzir padding de `px-2.5 py-1` para `px-2 py-0.5 sm:px-2.5 sm:py-1`

### 2. Hero — Refinamento de Contraste e Posicionamento

**`src/pages/Landing.tsx`**:
- Ajustar o `min-h-[100vh]` para `min-h-[100svh]` (usa viewport visual no mobile, evita overflow com barra de endereço)
- Aumentar overlay no centro: trocar `via-purple-950/50` para `via-purple-950/55` — mais contraste na zona de copy
- Reduzir `space-y-7` do content container para `space-y-5 sm:space-y-7` (mais compacto em mobile)
- H1: adicionar `text-shadow` via style inline para reforçar legibilidade
- Subtitle: garantir `text-white/85` (já está ok)

### 3. Limpeza de Legados (Retomando Plano V1)

| Arquivo | Ação |
|---------|------|
| `src/test/example.test.ts` | Deletar — placeholder sem valor |
| `src/pages/Customize.tsx` L320 | Remover `console.warn` — silenciar em produção |
| 9 arquivos com `as any` | Manter por agora — dependem de regeneração dos tipos Supabase (não é possível editar `types.ts`) |

### 4. WhyArtisCase — Refinamento Mobile

**`src/components/WhyArtisCase.tsx`**:
- Cards com padding menor em mobile: `pt-6 pb-4 px-4 sm:pt-8 sm:pb-6 sm:px-6`
- Logos Epson menores em mobile: `h-7 sm:h-9` e `h-8 sm:h-10`

### Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/AppHeader.tsx` | Responsive sizing para mobile |
| `src/components/CoinBalance.tsx` | Padding responsivo |
| `src/pages/Landing.tsx` | Hero `100svh`, contraste, spacing mobile |
| `src/components/WhyArtisCase.tsx` | Padding e logos responsivos |
| `src/pages/Customize.tsx` | Remover `console.warn` |
| `src/test/example.test.ts` | Deletar |

