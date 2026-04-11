

## Controles de filtro no footer + Upscale vira "Refinar" na tab Filtros IA

### Alteracoes

**1. Novo `FilterHistoryBar.tsx`**
- Barra compacta com chips dos filtros aplicados + botoes Comparar/Desfazer/Remover
- Renderizada no footer mobile do `Customize.tsx`, acima do `MobileTabBar`, sempre visivel quando `filterHistory.length > 0`

**2. `AiFiltersList.tsx`**
- Adicionar botao "Refinar" (Sparkles icon) no topo, antes dos filtros — recebe props `onUpscale`, `isHD`, `upscaleCost`, `isUpscaling`
- Esconder a secao de historico quando renderizado dentro do overlay mobile (nova prop `hideHistory`)

**3. `AdjustmentsPanel.tsx`**
- Remover o botao de Upscale

**4. `ImageControls.tsx` + `MobileTabOverlay.tsx`**
- Passar props de upscale para `AiFiltersList`
- Passar `hideHistory` no mobile overlay

**5. `Customize.tsx`**
- Importar `FilterHistoryBar` e renderizar no bloco `lg:hidden` do footer, entre o conteudo e o `MobileTabBar`

### Layout mobile resultante
```text
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│   Phone Preview         │
├─────────────────────────┤
│ 2 filtros: [1.X][2.Y]  │ ← FilterHistoryBar (condicional)
│ [👁][↩][✕]              │
├─────────────────────────┤
│ [Ajustes][Filtros][Gal] │ ← MobileTabBar fixo
├─────────────────────────┤
│ [↺ Reset] [Finalizar →]│ ← ContinueBar fixo
└─────────────────────────┘
```

### Desktop — sem alteracao visual
Os controles de historico continuam inline dentro do `AiFiltersList` na sidebar. O botao "Refinar" aparece no topo da lista de filtros, igual.

