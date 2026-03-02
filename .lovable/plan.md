

# Corrigir Warning de Ref no ControlPanel e FilterPresets

## Problema
React emite warning "Function components cannot be given refs" porque `TabsContent` do Radix tenta passar ref para `ControlPanel` e `FilterPresets`, que sao function components sem `forwardRef`.

## Solucao
Envolver ambos os componentes com `React.forwardRef`:

### 1. `src/components/ControlPanel.tsx`
- Importar `forwardRef` do React
- Envolver o componente com `forwardRef<HTMLDivElement, ControlPanelProps>`
- Passar `ref` para a div raiz

### 2. `src/components/FilterPresets.tsx`
- Importar `forwardRef` do React
- Envolver o componente com `forwardRef<HTMLDivElement, FilterPresetsProps>`
- Passar `ref` para a div raiz

Mudanca minima, apenas wrapping com forwardRef e adicionando ref na div externa.

