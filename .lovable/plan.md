

## Corrigir Sidebar Mobile: Primeiro Item Escondido Atrás do Header

### Problema
A sidebar mobile e o `AppHeader` usam ambos `z-50`. Como o `AppHeader` é renderizado depois no DOM (dentro do flex-1), ele aparece por cima da sidebar, escondendo o grupo "Operações" e o item "Pedidos" no topo.

### Solução

**1 arquivo editado: `src/components/ui/sidebar.tsx`**

No bloco mobile do componente `Sidebar` (linhas 173-196), mudar o z-index do backdrop e do painel de `z-50` para `z-[60]`:

- Linha 178: backdrop `fixed inset-0 z-50` → `fixed inset-0 z-[60]`
- Linha 184: painel `fixed inset-y-0 z-50` → `fixed inset-y-0 z-[60]`

Isso garante que a sidebar mobile fique acima do `AppHeader` (`z-50`), tornando todos os itens do menu visíveis incluindo "Operações" e "Pedidos".

### Resultado
- Sidebar mobile aparece por cima do header
- Todos os itens do menu ficam visíveis e clicáveis
- Auto-close ao selecionar item continua funcionando (já implementado)
- Nenhum impacto no layout desktop

