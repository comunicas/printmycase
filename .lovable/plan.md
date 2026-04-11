

## Fix: Limpar filtros ao subir nova imagem

### Problema
Ao fazer upload de uma nova imagem, o código reseta apenas `activeFilterId`, mas **não limpa** `filteredImage` nem `filterHistory`. Isso mantém os chips de filtros antigos e o estado de imagem filtrada da sessão anterior.

Compare com `handleGalleryImageSelect` que faz corretamente:
```ts
setActiveFilterId(null);
setFilteredImage(null);
setFilterHistory([]);
```

### Correção

**`src/hooks/useCustomize.tsx` — função `processImageFile` (~linha 178-181)**

Adicionar `setFilteredImage(null)` e `setFilterHistory([])` junto ao `setActiveFilterId(null)` existente:

```ts
const processImageFile = useCallback((file: File) => {
  setImageFileName(file.name);
  setIsCompressing(true);
  setActiveFilterId(null);
  setFilteredImage(null);    // ← adicionar
  setFilterHistory([]);      // ← adicionar
  // ... resto permanece igual
```

Alteração de 2 linhas em 1 arquivo.

