# Plano — Acessibilidade e robustez do drawer mobile do `AppHeader`

## Diagnóstico

Reli o `AppHeader.tsx` atual e o screenshot enviado. Pendências:

1. **Drawer cortado / sob o conteúdo** (visível no print): o drawer está dentro do `<header>`, que vive dentro de containers com contexto de stacking — por isso o `fixed` aparece confinado. Solução: renderizar via **portal** no `document.body`.
2. **Fechar ao clicar fora**: já existe overlay com `onClick`, mas o painel interno não tem `stopPropagation` — funciona por acaso. Vou tornar explícito.
3. **iOS scroll-jank**: o lock atual é só `overflow: hidden` no body, que **não funciona no iOS Safari** (continua rolando o background). Solução: usar técnica `position: fixed; top: -scrollY` e restaurar `scrollTo` ao fechar.
4. **Foco ao abrir**: hoje o foco fica no botão hambúrguer. Mover para o botão de fechar do drawer.
5. **Escape**: hoje não fecha. Adicionar listener de `keydown`.
6. **Restaurar foco ao fechar**: hoje o foco fica perdido. Devolver para o botão hambúrguer (acessibilidade WCAG).
7. **Fechar ao navegar por qualquer link**: hoje cada `Link` chama `closeMobile` manualmente. Melhor: observar mudança de `useLocation()` e fechar automaticamente — cobre links internos, externos ao menu, redirects, etc., sem repetir handlers.
8. **Atributos ARIA**: adicionar `aria-expanded`, `aria-haspopup`, `aria-label`, `aria-modal`.

## Mudanças

Arquivo único: `src/components/AppHeader.tsx`.

### a) Portal
- Importar `createPortal` de `react-dom`.
- Renderizar o drawer via `createPortal(drawer, document.body)` dentro do `<header>`. Garante cobertura de tela inteira independentemente do contexto de stacking pai. `z-[100]` para ficar sobre tudo.

### b) iOS-safe scroll lock
No `useEffect` que dispara quando `mobileOpen` vira `true`:
- Salvar `scrollY = window.scrollY`.
- Aplicar `body.style.position = 'fixed'; top = '-{scrollY}px'; left/right = 0; width = 100%; overflow = hidden`.
- No cleanup: restaurar todos os estilos e chamar `window.scrollTo(0, scrollY)`.
- Guardar valores anteriores para restauração precisa.

### c) Foco ao abrir + restaurar ao fechar
- `triggerRef = useRef<HTMLButtonElement>` no botão hambúrguer.
- `closeRef = useRef<HTMLButtonElement>` no botão X.
- Quando abre: `setTimeout(() => closeRef.current?.focus(), 0)`.
- No cleanup do mesmo effect: `triggerRef.current?.focus()`.

### d) Escape
- No effect de abertura, adicionar `document.addEventListener('keydown', onKey)` com `if (e.key === 'Escape') setMobileOpen(false)`.
- Remover no cleanup.

### e) Auto-close em navegação
- Adicionar `const location = useLocation()`.
- `lastRouteRef = useRef(pathname+search+hash)`.
- `useEffect` que compara rota atual com `lastRouteRef` e fecha drawer quando mudar.
- Permite remover `onClick={closeMobile}` redundante de cada Link (mas mantenho como UX imediato — não atrapalha).

### f) Click fora
- Manter `onClick={closeMobile}` no overlay.
- Adicionar `onClick={(e) => e.stopPropagation()}` no painel interno (proteção explícita).

### g) ARIA
- No drawer: `role="dialog"`, `aria-modal="true"`, `aria-label="Menu de navegação"`.
- No trigger: `aria-expanded={mobileOpen}`, `aria-haspopup="dialog"`, `aria-label="Abrir menu"`.
- Overlay: `aria-hidden="true"`.

### h) Scroll interno do drawer
- Adicionar `overscroll-contain` no `<nav>` interno para evitar que o scroll do menu propague para o body em iOS.

## Resultado esperado

- Drawer cobre a tela inteira corretamente em qualquer página (incluindo Checkout, Customize).
- Background travado em iOS sem rubber-band; ao fechar, volta exatamente para a posição de scroll original.
- Tab/Escape funcionam; foco visível e previsível; leitores de tela anunciam o dialog.
- Qualquer navegação (link interno, externo, programática) fecha o drawer automaticamente.

## Arquivo editado

- `src/components/AppHeader.tsx` (única edição)
