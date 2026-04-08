

## Melhorar Cards de Gerações IA + Modal de Galeria Completa + Fix Build Errors

### 1. Fix Build Errors (pré-requisito)

**`src/types/customization.ts`**: Os erros são porque valores indexados de `Record<string, unknown>` retornam `Json` mas o tipo esperado é `string`. Adicionar casts explícitos `as string` nos retornos condicionais que já validam o tipo com `typeof === "string"`.

**`src/pages/CheckoutSuccess.tsx`**: Cast `order.customization_data` para `Json` antes de passar ao parser.

### 2. Melhorar Cards — Landing Page (`src/components/AiCoinsSection.tsx`)

- Tornar cada card clicável — ao clicar, abre um modal lightbox com a imagem em tela cheia
- No mobile: cards maiores com `columns-2` e aspect ratio mais generoso
- No desktop: manter `columns-4` com hover zoom + badge do filtro
- Adicionar botão "Ver todas as gerações" abaixo da galeria que abre o modal completo

### 3. Melhorar Cards — MyGenerations (`src/pages/MyGenerations.tsx`)

- Substituir o hover-only overlay por botões sempre visíveis no mobile (touch não tem hover)
- Tornar cards clicáveis para abrir lightbox/modal com imagem ampliada
- No modal: mostrar imagem grande, nome do filtro, tipo, data, botões de download e deletar

### 4. Novo componente: Modal de Galeria (`src/components/AiGalleryModal.tsx`)

- Dialog fullscreen no mobile, max-w-4xl no desktop
- Carrega TODAS as gerações públicas (sem limit) com scroll infinito ou paginação
- Grid responsivo: 2 colunas mobile, 3-4 desktop
- Cada imagem clicável para lightbox individual
- Botão CTA "Crie a Sua" fixo no rodapé do modal

### Fluxo

```text
Landing page cards → click card → lightbox da imagem
                   → "Ver Todas" → AiGalleryModal (todas as gerações públicas)

MyGenerations cards → click card → lightbox com ações (download/delete)
```

### Arquivos alterados
1. `src/types/customization.ts` — fix type casts
2. `src/pages/CheckoutSuccess.tsx` — fix cast
3. `src/components/AiCoinsSection.tsx` — cards clicáveis + botão "Ver Todas"
4. `src/components/AiGalleryModal.tsx` — novo modal de galeria completa
5. `src/pages/MyGenerations.tsx` — cards melhorados + lightbox

