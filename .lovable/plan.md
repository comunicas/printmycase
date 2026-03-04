

# Melhorar seletor de imagens da galeria

## Problemas atuais
1. O grid mostra apenas a imagem sem nenhum identificador — difícil saber qual é qual
2. Código legado: lógica de detecção de pastas vs. arquivos no root é desnecessária e confusa
3. Placeholder `.emptyFolderPlaceholder` precisa ser filtrado

## Plano

### 1. Refatorar `ProductImagesUpload.tsx`
- **Armazenar nome do arquivo junto com a URL** — mudar o state de `string[]` para `{ url: string; name: string }[]`
- **Exibir o nome do arquivo** abaixo de cada thumbnail no grid (truncado se longo)
- **Simplificar `fetchImages`** — remover lógica legada de detecção root file vs folder, manter apenas a listagem recursiva de pastas
- **Filtrar placeholders** (`.emptyFolderPlaceholder`) como já faz, mas de forma mais limpa
- Extrair o nome legível do path: `folder/gallery-123.png` → `gallery-123.png`

### 2. Layout do grid
- Cada item mostra: thumbnail + nome do arquivo abaixo (texto pequeno, truncado)
- Manter seleção por clique com check overlay

## Arquivo afetado

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/ProductImagesUpload.tsx` | Refatorar fetch, adicionar nome do arquivo no grid |

