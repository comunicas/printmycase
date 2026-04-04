

## Corrigir Layout Mobile dos Cards de Pedido + Auto-fechar Sidebar

### 1. Auto-fechar sidebar no mobile ao selecionar seção

**Arquivo: `src/components/admin/AdminSidebar.tsx`**

- Importar `useIsMobile` de `@/hooks/use-mobile`
- No `onClick` de cada `SidebarMenuButton`, após chamar `onSectionChange`, chamar `toggleSidebar()` quando `isMobile` for true
- Usar `toggleSidebar` do `useSidebar()`

### 2. Corrigir cards de pedido no mobile

**Arquivo: `src/components/admin/OrdersManager.tsx`**

O card atual usa `flex items-center justify-between` numa única linha, o que quebra em telas pequenas porque tenta manter thumbnail + texto + badge + preço lado a lado.

Mudanças:
- No mobile, empilhar o layout: linha 1 = thumbnail + nome/cliente/data, linha 2 = badge + preço alinhados à direita
- Trocar o container de `flex items-center justify-between` para `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`
- Mover badge + preço para uma div separada com `flex items-center gap-2 ml-auto sm:ml-0`
- Reduzir `max-w-[220px]` do nome do produto para `max-w-[160px]` no mobile ou usar classe responsiva
- O ID `#xxxxxxxx` pode ir para uma nova linha no mobile (hidden em telas muito pequenas ou quebrar linha)

### Resultado
- Sidebar fecha ao tocar num item no mobile
- Cards de pedido não quebram layout em telas de 375px

