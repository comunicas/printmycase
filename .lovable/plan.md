

## Code Review: Home, Customização e Admin

### Problemas Encontrados

---

#### HOME (`Landing.tsx`)

1. **Botão "Voltar" da header na Landing redireciona para `/product/{slug}`** — O `CustomizeHeader` tem `onBack` apontando para `/product/${slug}`, mas a página de produto não é mais linkada internamente. Deveria voltar para `/customize` (seleção de modelo) ou `/catalog`.

2. **Console warnings: forwardRef** — Os logs mostram warnings em `ProductGallery`, `ProductInfo` e `ProductDetails` recebendo refs sem `forwardRef`. Não é crítico, mas polui o console na página de produto (SEO).

3. **Hero `heroBg` importado como asset** — Funciona, mas o import estático pesa no bundle. Considerar lazy loading ou `<link rel="preload">`.

4. **Vitrine limitada a 4 produtos** — `useProducts(4)` traz os 4 mais recentes. Seria melhor trazer os mais populares ou com maior rating.

---

#### CUSTOMIZAÇÃO (`Customize.tsx` + `useCustomize.tsx`)

5. **Back button aponta para página de produto** (linha 24) — `onBack={() => navigate(c.product ? `/product/${c.product.slug}` : "/catalog")}` deveria ser `/customize` (SelectModel) ou `-1`, já que a página de produto não é mais o fluxo principal.

6. **ModelSelector carrega TODOS os produtos a cada render** — `useProducts()` sem limit faz fetch de ~73 produtos toda vez que o dropdown é montado. Deveria ter cache ou usar o mesmo hook com memoização.

7. **Mobile ContinueBar duplicado** — O `ContinueBar` sem `inline` renderiza um bloco `hidden lg:hidden` (nunca visível) + mobile. O bloco desktop sem inline é deadcode (linha 61: `hidden lg:hidden`).

8. **`useCustomize` é um hook gigante (517 linhas)** — Concentra estado de imagem, filtros, upscale, draft, checkout, termos. Difícil de manter. Candidato a split em hooks menores.

9. **`processImageFile` usa `useCallback` sem `user` nas deps** — Referencia `setShowLoginDialog` e `setShowUpscaleDialog` dentro do toast action, mas o `user` vem de closures que podem ficar stale.

10. **Restauração de draft com refs (`sessionRestored`, `pendingRestored`)** — Lógica frágil: se o usuário trocar de produto (slug muda), os refs não resetam e o draft do produto anterior não é restaurado.

11. **`coinBalance` stale no cálculo de low balance** — Linhas 323/382 usam `coinBalance` do momento do render, não o saldo atualizado pós-dedução.

---

#### ADMIN (`Admin.tsx` + `AiFiltersManager.tsx`)

12. **`AiFiltersManager` usa `as any` para contornar tipos** — Linhas 166, 176, 184 fazem cast `as any` para `send_style_image`. Os tipos gerados provavelmente já incluem esse campo; vale verificar se o cast é necessário.

13. **Falta de `send_style_image` na interface local `AiFilter`** — A interface na linha 18-26 não inclui `send_style_image`, forçando os casts.

14. **Admin não tem paginação** — Tabs de Pedidos e Transações carregam tudo de uma vez. Com crescimento, ficará lento.

15. **Admin não tem busca de filtros** — Com muitos filtros cadastrados, não há como pesquisar.

---

### Plano de Correções (Priorizado)

**P0 — Bugs funcionais**

| # | Arquivo | Correção |
|---|---------|----------|
| 5 | `Customize.tsx` | Alterar `onBack` de `/product/${slug}` para `/customize` |
| 7 | `ContinueBar.tsx` | Remover bloco deadcode `hidden lg:hidden` (linhas 60-67) |
| 10 | `useCustomize.tsx` | Resetar `sessionRestored.current` e `pendingRestored.current` quando `product.slug` mudar |

**P1 — Qualidade de código**

| # | Arquivo | Correção |
|---|---------|----------|
| 12-13 | `AiFiltersManager.tsx` | Adicionar `send_style_image` à interface local e remover `as any` |
| 2 | `ProductGallery.tsx`, `ProductInfo.tsx`, `ProductDetails.tsx` | Envolver com `forwardRef` para eliminar warnings |

**P2 — Performance / UX**

| # | Arquivo | Correção |
|---|---------|----------|
| 6 | `ModelSelector.tsx` | Considerar mover `useProducts()` para um contexto ou memoizar |
| 11 | `useCustomize.tsx` | Usar `refreshCoins()` retornando o saldo atualizado em vez de calcular com valor stale |

### Arquivos afetados
1. `src/pages/Customize.tsx` — fix back navigation
2. `src/components/customize/ContinueBar.tsx` — remove deadcode
3. `src/hooks/useCustomize.tsx` — reset refs on slug change, fix stale balance
4. `src/components/admin/AiFiltersManager.tsx` — fix interface + remove `as any`
5. `src/components/ProductGallery.tsx` — add forwardRef
6. `src/components/ProductInfo.tsx` — add forwardRef
7. `src/components/ProductDetails.tsx` — add forwardRef

