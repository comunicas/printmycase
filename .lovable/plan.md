

## Fundo claro nas seções da Landing Page

As seções **Como funciona**, **Modelos em Destaque** e **O que nossos clientes dizem** atualmente herdam `bg-background` (cinza claro em light mode) ou usam `bg-muted/30`. O objetivo é garantir que todas tenham um fundo explicitamente claro (`bg-white` ou equivalente) para maior contraste e limpeza visual.

### Alterações

**Arquivo:** `src/pages/Landing.tsx`

1. **Como funciona** (`#como-funciona`) — adicionar `bg-white` à `<section>`.
2. **Modelos em Destaque** (`#destaques`) — adicionar `bg-white` à `<section>`.
3. **O que nossos clientes dizem** (`#depoimentos`) — trocar `bg-muted/30` por `bg-white`.

Nenhuma outra mudança de layout, tipografia ou funcionalidade será feita.

