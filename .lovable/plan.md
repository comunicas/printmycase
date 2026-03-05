

## Code Review & Limpeza de Legados — Landing Page

Análise completa do frontend da home (`Landing.tsx` e componentes relacionados).

---

### Checklist de Problemas Encontrados

#### Legados e Código Morto

- [x] **Font conflict**: Alinhado para `Inter` em `tailwind.config.ts` e `index.css`. Removido `Poppins`.
- [x] **Variáveis CSS de sidebar não usadas**: Removidas 8 variáveis `--sidebar-*` do CSS e cores `sidebar.*` do Tailwind config.
- [x] **Variáveis `--chart-*` não usadas**: Removidas 5 variáveis de chart do CSS.
- [x] **Font `serif` e `mono` no config**: Removidas declarações customizadas não utilizadas.
- [x] **`will-change: transform` no parallax**: Removido de `.parallax-bg`.

#### Qualidade de Código

- [x] **`SeoHead` faz fetch redundante**: Corrigido para não chamar `useProducts` quando props são fornecidas.
- [x] **Botões Hero duplicados**: "Ver Modelos" agora faz scroll suave para `#destaques`.
- [x] **`React` import desnecessário**: Substituído por `import { Fragment }`.
- [x] **Inline styles repetidos**: Extraídos para função utilitária `fadeIn()`.
- [x] **`as any` casting em hooks**: Substituído por tipos gerados `Tables<"products">`.

#### Performance

- [x] **ScrollReveal cria 1 IntersectionObserver por instância**: Refatorado para singleton compartilhado.
- [x] **Google Fonts blocking render**: Movido `@import` para `<link rel="stylesheet">` no `index.html`.

#### Acessibilidade

- [x] **Hero section sem landmark**: Adicionado `aria-label="Banner principal"`.
- [x] **Stars decorativas sem `aria-hidden`**: Adicionado `aria-hidden="true"` nos containers de estrelas.

---

### Arquivos Alterados

| Arquivo | Alterações |
|---|---|
| `tailwind.config.ts` | Removido sidebar colors, serif/mono fonts, alinhado font sans para Inter |
| `src/index.css` | Removidas variáveis sidebar/chart, removido `will-change`, removido `@import` de font |
| `index.html` | Adicionado `<link rel="stylesheet">` para Google Fonts |
| `src/pages/Landing.tsx` | Removido import `React`, extraído `fadeIn()`, corrigido botão duplicado, aria attrs |
| `src/components/SeoHead.tsx` | Evita fetch redundante quando props são fornecidas |
| `src/hooks/useScrollAnimation.ts` | Refatorado para observer singleton compartilhado |
| `src/hooks/useProducts.ts` | Removido `as any`, usa tipos gerados do Supabase |
