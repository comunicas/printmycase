

# Remover Controles de Brilho e Contraste

## Mudancas

### 1. `src/components/ControlPanel.tsx`
- Remover os controles "Bright" e "Contrast" do array `controls`
- Remover as props `brightness`, `contrast`, `onBrightnessChange`, `onContrastChange` da interface
- Remover imports dos icones `Sun` e `Contrast`

### 2. `src/pages/Index.tsx`
- Remover os estados `brightness` e `contrast` (useState)
- Remover as props correspondentes passadas ao `ControlPanel`
- Remover `brightness` e `contrast` das props passadas ao `PhonePreview`

### 3. `src/components/PhonePreview.tsx`
- Remover `brightness` e `contrast` da interface de props
- Simplificar `baseFilter` para retornar string vazia ou apenas o `extraFilter` dos presets
- Se nao houver extraFilter, nao aplicar filter nenhum

Os filtros AI (Vivid, Noir, Warm, Cool) continuam funcionando normalmente pois usam `extraFilter` que e independente.

