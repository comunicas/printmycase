

## Upscale como categoria "Refinar" na lista de filtros

### Problema
Atualmente o Refinar aparece como um botao separado no topo da lista. O usuario quer que ele apareca como uma **categoria visual** igual as outras (ex: "Character Pop"), com o titulo "REFINAR" e os itens dentro do grid.

### Alteracao unica em `AiFiltersList.tsx`

Remover o `<Button>` de Refinar e renderizar uma seção de categoria fake chamada "REFINAR" no **final** da lista (após as categorias reais e uncategorized), contendo um unico item no grid de 3 colunas:

- Titulo: `<p>` com mesmo estilo das categorias (`text-[11px] font-semibold uppercase`)
- Item: mesmo layout visual de um filtro (thumbnail quadrado + label + badge de custo), mas ao clicar chama `onUpscale` ao inves de `onFilterClick`
- Thumbnail: gradiente com icone `Sparkles` (similar aos filtros sem imagem)
- Label: "Refinar" / "Já em HD" / "Processando..."
- Badge: `🪙{upscaleCost}`
- Estado disabled quando `isHD || isUpscaling || disabled`
- Spinner overlay quando `isUpscaling`

### Resultado visual
Fica identico a screenshot: categoria "REFINAR" com card visual no grid, igual aos filtros normais.

