

## Transicao suave na FilterHistoryBar + desabilitar controles durante processamento IA

### Alteracoes

**1. `src/components/customize/FilterHistoryBar.tsx`** - Transicao de altura
- Remover o `if (filterHistory.length === 0) return null` — manter sempre montado
- Usar um wrapper `div` com `overflow-hidden` e `transition-all duration-300`
- Quando `filterHistory.length === 0`: `max-height: 0, py-0, border-0`
- Quando `filterHistory.length > 0`: `max-height: 200px, py-2, border-t`
- Resultado: entrada e saida suaves sem salto visual

**2. `src/components/customize/MobileTabBar.tsx`** - Desabilitar tabs durante processamento
- Adicionar prop `disabled?: boolean`
- Quando `disabled=true`: aplicar `opacity-50 pointer-events-none` nas tabs

**3. `src/components/customize/FilterHistoryBar.tsx`** - Desabilitar botoes durante processamento
- Adicionar prop `disabled?: boolean`
- Passar `disabled` para todos os `Button` e desabilitar os handlers de compare

**4. `src/components/customize/ContinueBar.tsx`** - Ja recebe `disabled` (ok)

**5. `src/pages/Customize.tsx`** - Passar `isProcessing` para os componentes
- `<MobileTabBar disabled={c.isProcessing} />`
- `<FilterHistoryBar disabled={c.isProcessing} />`

O `isProcessing` ja agrega todos os estados relevantes: compressao, renderizacao, filtro IA em andamento e upscale.

