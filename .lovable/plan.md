

## Plano: Corrigir acesso a todos os filtros IA no desktop

### Problema
No desktop, o container dos filtros usa `scrollbar-hide` e não há drag-to-scroll com mouse. O usuário não consegue acessar filtros que ficam fora da área visível.

### Solução

**`src/pages/Customize.tsx`** — Mudar o layout dos filtros para `flex-wrap` em vez de scroll horizontal:

- Trocar `overflow-x-auto scrollbar-hide` por `flex-wrap`
- Remover os estilos inline de touch-action (desnecessários com wrap)
- Os filtros vão quebrar linha naturalmente, mostrando todos visíveis sem necessidade de scroll

Isso funciona bem porque os botões são pequenos e poucos, cabem em 2-3 linhas facilmente.

### Arquivo alterado
- `src/pages/Customize.tsx` (1 linha)

