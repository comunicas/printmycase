

## Revisão: Galeria Global no Produto + Input do Admin

### Diagnóstico

**Galeria no produto** — a implementação está correta: `Product.tsx` busca imagens ativas ordenadas por `sort_order` e passa ao `ProductGallery`, que as exibe após as imagens do produto com separador visual.

**Input de label no admin** — problema encontrado: o `onChange` do campo label chama `updateField` a cada tecla digitada, fazendo uma requisição ao banco **por caractere**. Isso causa lentidão e uso excessivo de requests.

### Plano

**1. Debounce no input de label** (`GalleryImagesManager.tsx`)
- Manter estado local para o valor do input
- Salvar no banco apenas após o usuário parar de digitar (~500ms) ou no `onBlur`
- Extrair um sub-componente `EditableLabel` para isolar o estado local de cada linha

**2. Sem alterações no `ProductGallery.tsx` ou `Product.tsx`** — a integração está funcionando corretamente.

### Arquivo alterado
| Arquivo | Alteração |
|---|---|
| `src/components/admin/GalleryImagesManager.tsx` | Debounce/onBlur no campo label |

