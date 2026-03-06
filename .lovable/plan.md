

## Plano: Refinar UX dos botões de filtros IA

### Problemas identificados

1. **Linha 335** — ternário redundante: ambos os ramos retornam `filter.name` (sem spinner no botão sendo processado)
2. **Sem feedback visual** — ao clicar num filtro, não há spinner no botão específico que está processando
3. **Botão "Original"** aparece/desaparece causando layout shift nos chips
4. **Estado de loading genérico** — `isApplyingFilter` bloqueia todos os botões mas não indica qual está ativo
5. **Falta de indicação visual** de qual filtro está sendo processado vs qual já foi aplicado

### Solução

**`src/pages/Customize.tsx`**:

- Trocar `isApplyingFilter: boolean` por `applyingFilterId: string | null` para rastrear qual filtro específico está processando
- Mostrar `Loader2` spinner apenas no botão do filtro sendo processado
- Manter os outros botões desabilitados mas sem spinner
- Botão "Original" sempre visível quando há filtro ativo, com ícone `Undo2` compacto
- Clicar no filtro já ativo reverte ao original (toggle behavior) — elimina necessidade de botão separado
- Simplificar o layout removendo o botão "Original" separado

### Comportamento final

| Ação | Resultado |
|------|-----------|
| Clicar filtro inativo | Aplica filtro, mostra spinner naquele botão |
| Clicar filtro já ativo | Reverte ao original (toggle) |
| Durante processamento | Spinner no botão clicado, demais desabilitados |

### Arquivo alterado
- `src/pages/Customize.tsx`

