

## Mover Controles de Filtro para Próximo do Frame (Mobile)

### Problema
Os controles de comparar/desfazer/remover filtro e os chips de histórico ficam dentro do `AiFiltersList`, que vive dentro da modal bottom sheet. Como a modal fecha automaticamente após aplicar um filtro, o usuário não consegue:
- Comparar antes/depois
- Desfazer o último filtro
- Remover todos os filtros

### Solução
Extrair os controles de filtro para um componente independente e exibi-lo no mobile **entre o preview e a tab bar**, sempre visível quando há filtros aplicados.

```text
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│                         │
│   Phone Preview         │
│                         │
├─────────────────────────┤
│ 2 filtros: [Street Toy] │  ← chips + controles
│ [👁 Comparar][↩ Desfazer][✕ Remover] │  ← sempre visíveis
├─────────────────────────┤
│ [Ajustes][Filtros][Gal] │  ← tab bar
├─────────────────────────┤
│ [↺]  [Finalizar →]     │  ← continue bar
└─────────────────────────┘
```

### Alterações

**1. Criar `src/components/customize/FilterHistoryBar.tsx`**
- Componente que recebe `filterHistory`, `onCompareStart/End`, `onUndoLastFilter`, `onRemoveFilter`
- Exibe os chips de filtros aplicados + botões de ação (comparar, desfazer, remover)
- Compacto, horizontal, com scroll para chips
- Só renderiza quando `filterHistory.length > 0`

**2. `src/components/customize/AiFiltersList.tsx`**
- Manter os controles no desktop (dentro do componente, como está)
- No mobile (via prop `hideMobileControls`), ocultar a seção de chips + botões, pois já estará no `FilterHistoryBar`

**3. `src/pages/Customize.tsx`**
- Adicionar `<FilterHistoryBar>` no bloco do footer mobile, acima do `MobileTabBar`
- Passar as props de compare/undo/remove diretamente do hook `useCustomize`

**4. `src/components/customize/MobileTabOverlay.tsx`**
- Passar `hideMobileControls={true}` ao `AiFiltersList` para evitar duplicação

### Detalhes técnicos
- `FilterHistoryBar` usa `lg:hidden` para aparecer só no mobile
- Layout com `flex-wrap` para chips e `flex gap-1.5` para botões
- Z-index herda do container pai (z-60 do footer mobile)
- Botões mantêm o mesmo estilo compacto (h-7, text-[11px])

