

## Remover Header e Eliminar Scroll Vertical na Página de Customização

### Objetivo
Transformar a página de customização em uma experiência fullscreen imersiva, sem header e sem scroll vertical — todo o conteúdo visível na viewport.

### Alterações em `src/pages/Customize.tsx`

1. **Remover AppHeader**: Eliminar o import e uso do `AppHeader` e a variável `breadcrumbs`
2. **Adicionar botão de voltar minimal**: Um pequeno botão no canto superior-esquerdo (ícone `ArrowLeft` ou `X`) para navegar de volta ao produto
3. **Layout fullscreen sem scroll**: Trocar `min-h-screen` por `h-screen` (ou `h-dvh`) e adicionar `overflow-hidden` no container raiz
4. **Ajustar main**: Usar `flex-1 overflow-hidden` para que o conteúdo se distribua verticalmente sem gerar scroll
5. **Ajustar padding bottom mobile**: Remover `pb-28` excessivo, pois sem header há mais espaço vertical

### Resultado Visual

```text
┌──────────────────────────┐
│ ← Voltar     modelo name │  ← mini bar translúcida
│                          │
│                          │
│      [ Phone Mockup ]    │
│                          │
│                          │
│   🔍 Zoom ──────── 156%  │
│                          │
│  [Total]    [Continuar →]│  ← desktop inline / mobile sticky
└──────────────────────────┘
```

Nenhuma outra página ou componente é afetado.

