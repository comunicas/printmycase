

## Filtros sequenciais com histórico

### Comportamento atual
Linha 321 de `useCustomize.tsx`: `const sourceImage = originalImage || image;` — **sempre usa a imagem original**, nunca a filtrada. Segundo filtro descarta o resultado do primeiro.

### Comportamento desejado
Cada filtro aplicado usa a **última imagem gerada** como base. Manter histórico para permitir "desfazer" passo a passo.

### Alterações

**1. `src/hooks/useCustomize.tsx` — Estado de histórico**
- Adicionar `filterHistory: Array<{ filterId: string; image: string }>` (estado)
- `originalImage` continua sendo a imagem pré-filtros (para reset total)

**2. `handleFilterConfirm` — Usar imagem atual como source**
- Trocar `const sourceImage = originalImage || image` por `const sourceImage = image` (a imagem exibida, que já é a última filtrada)
- Após sucesso, push no `filterHistory`: `{ filterId, image: resultImage }`
- `activeFilterId` passa a ser o último filtro aplicado

**3. `handleFilterClick` — Comportamento ao clicar filtro já ativo**
- Clicar no filtro ativo atual: remove último do histórico, volta à imagem anterior (undo do último filtro)
- Se histórico vazio após remoção, volta ao `originalImage`

**4. `handleRemoveFilter` / Reset**
- "Remover todos" volta ao `originalImage` e limpa `filterHistory`
- `handleReset` já faz isso

**5. UI — Indicador de filtros empilhados**
- Em `AiFiltersList.tsx`: mostrar badges/chips dos filtros aplicados no histórico (pequenos, clicáveis para remover)
- Contador simples: "2 filtros aplicados"

**6. Persistência no pending checkout**
- `handleContinue`: salvar `filterHistory` (lista de filterIds) no `customization_data`
- Restore: recarregar apenas a imagem final (não re-aplicar filtros), mas manter a lista para referência

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useCustomize.tsx` | `filterHistory` estado + `sourceImage = image` + undo |
| `src/components/customize/AiFiltersList.tsx` | Badge/chip com filtros empilhados |
| `src/lib/customize-types.ts` | Tipo `FilterHistoryEntry` |

