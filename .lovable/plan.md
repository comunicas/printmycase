

## Plano: Refatorar Customize.tsx em componentes menores

### Estrutura proposta

```text
src/pages/Customize.tsx          (orquestrador — state + layout)
src/components/customize/
  ├── CustomizeHeader.tsx         (top bar com voltar + nome)
  ├── ImageControls.tsx           (tabs com Ajustes + Filtros)
  ├── AdjustmentsPanel.tsx        (zoom slider + rotação)
  ├── AiFiltersList.tsx           (lista de filtros IA)
  └── ContinueBar.tsx             (botão continuar — desktop + mobile)
src/lib/image-utils.ts            (compressImage + renderSnapshot)
src/lib/customize-types.ts        (AiFilter, DEFAULTS, PHONE_W/H)
```

### Divisão de responsabilidades

**`src/lib/customize-types.ts`** — Tipos e constantes compartilhados:
- `AiFilter` interface, `DEFAULTS`, `PHONE_W`, `PHONE_H`

**`src/lib/image-utils.ts`** — Funções puras utilitárias:
- `compressImage()` e `renderSnapshot()` (movidas do Customize.tsx)

**`CustomizeHeader`** — Props: `productName`, `onBack`

**`AdjustmentsPanel`** — Props: `scale`, `rotation`, `onScaleChange`, `onRotate`, `disabled`

**`AiFiltersList`** — Props: `filters`, `activeFilterId`, `applyingFilterId`, `disabled`, `onFilterClick`

**`ImageControls`** — Compõe `AdjustmentsPanel` + `AiFiltersList` dentro de `Tabs`. Props: todos os acima + `hasImage`

**`ContinueBar`** — Props: `isModified`, `onReset`, `onContinue`, `disabled`, `isRendering`
- Renderiza ambas versões (desktop hidden em mobile, mobile hidden em desktop)

**`Customize.tsx`** — Mantém todo o state, hooks de draft, handlers de upload/filtro/continue. Compõe os sub-componentes passando props.

### Arquivos criados/editados
- **Criar**: 7 arquivos (2 em `src/lib/`, 5 em `src/components/customize/`)
- **Editar**: `src/pages/Customize.tsx` (simplificar para ~100 linhas)

