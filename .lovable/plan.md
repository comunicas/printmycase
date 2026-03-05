

## Code Review & Limpeza de Legados — Landing Page

Análise completa do frontend da home (`Landing.tsx` e componentes relacionados).

---

### Checklist de Problemas Encontrados

#### Legados e Código Morto

- [ ] **Font conflict**: `tailwind.config.ts` declara `Poppins` como font-family sans (linha 96), mas `index.css` importa `Inter` via Google Fonts (linha 1) e define `--font-sans: 'Inter'` (linha 65). Poppins nunca é carregada — uma das duas deve ser removida. Decisão: alinhar ambos para `Inter` (já importada) ou trocar para `Poppins` e importá-la.

- [ ] **Variáveis CSS de sidebar não usadas**: `index.css` define 8 variáveis `--sidebar-*` (linhas 49-63, 113-120) e `tailwind.config.ts` mapeia cores `sidebar.*` (linhas 51-59). A landing e o app inteiro não usam sidebar. Remover todas as referências.

- [ ] **Variáveis `--chart-*` não usadas**: 5 variáveis de chart no CSS (linhas 39-47, 108-112) sem nenhum componente de gráfico no projeto. Remover.

- [ ] **Font `serif` e `mono` no config**: `tailwind.config.ts` declara `Merriweather` e `JetBrains Mono` (linhas 108-127) mas nenhuma é importada nem usada. Remover as declarações customizadas.

- [ ] **`will-change: transform` no parallax**: `.parallax-bg` em `index.css` (linha 159) usa `will-change: transform` mas o elemento não tem transform animado — o `background-attachment: fixed` não é acelerado por GPU dessa forma. Remover a propriedade.

#### Qualidade de Código

- [ ] **`SeoHead` faz fetch redundante**: Quando `productsProp` não é passado, o componente faz seu próprio `useProducts(8)`. Na landing, os produtos já são passados via prop (`products={featuredProducts}`), mas o hook interno ainda é instanciado com `limit=0` (fetch desnecessário retornando todos os produtos). Corrigir: quando `productsProp` é fornecido, não chamar `useProducts` — usar early return ou condicional.

- [ ] **Botões Hero duplicados**: "Criar Minha Case" e "Ver Modelos" (linhas 80-94) ambos navegam para `/catalog`. O segundo botão não agrega valor. Trocar "Ver Modelos" para âncora `#destaques` (scroll suave) ou remover.

- [ ] **`React` import desnecessário**: `Landing.tsx` importa `React` (linha 1) para `React.Fragment`. Pode usar `<> </>` ou importar apenas `Fragment`.

- [ ] **Inline styles repetidos**: O padrão `style={{ animationDelay: "Xms", animationFillMode: "forwards" }}` aparece 4 vezes no hero (linhas 70, 75, 79, 98). Extrair para uma utility function ou classe CSS.

- [ ] **`as any` casting em hooks**: `useProducts` faz `(data as any[])` (linha 19) e `mapRow` recebe `any`. Os tipos do Supabase já existem em `types.ts` — usar o tipo gerado diretamente.

#### Performance

- [ ] **ScrollReveal cria 1 IntersectionObserver por instância**: A landing usa ~15 `ScrollReveal` wrappers, cada um criando seu próprio observer. Refatorar para um único observer compartilhado (singleton pattern ou context).

- [ ] **Google Fonts blocking render**: `@import url(...)` no CSS (linha 1 do `index.css`) é render-blocking. Mover para `<link rel="preload">` no `index.html` ou usar `font-display: swap` via parâmetro `&display=swap` (já presente, mas o `@import` em si bloqueia).

#### Acessibilidade

- [ ] **Hero section sem landmark**: A `<section>` do hero não tem `aria-label`. Adicionar `aria-label="Banner principal"`.

- [ ] **Imagens de logo no footer sem `alt` descritivo**: O footer usa texto "ArtisCase" como `<span>`, mas o logo no header é uma `<img>` — consistência ok, mas o footer poderia usar o logo também.

- [ ] **Stars decorativas sem `aria-hidden`**: Os ícones `Star` no hero e testimonials (linhas 101, 219) são decorativos — adicionar `aria-hidden="true"`.

---

### Arquivos Afetados

| Arquivo | Alterações |
|---|---|
| `tailwind.config.ts` | Remover sidebar colors, serif/mono fonts, alinhar font sans |
| `src/index.css` | Remover variáveis sidebar/chart, resolver conflito de font, remover `will-change` |
| `src/pages/Landing.tsx` | Remover import `React`, extrair inline styles, corrigir botão duplicado, aria attrs |
| `src/components/SeoHead.tsx` | Evitar fetch redundante quando props são fornecidas |
| `src/hooks/useScrollAnimation.ts` | Otimizar para observer compartilhado (opcional, melhoria de perf) |
| `src/hooks/useProducts.ts` | Remover `as any`, usar tipos gerados |

