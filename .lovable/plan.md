

## Cards em 4 Colunas nas Tabs de Customização

### Mudanças

**1. `src/components/customize/GalleryTab.tsx`**
- Linha 97: trocar `grid-cols-2` por `grid-cols-4` no grid de categorias de galeria
- Linha 76: manter `grid-cols-3` nas imagens internas (já são thumbnails menores) ou subir para `grid-cols-4`
- Reduzir padding/gap dos cards para caber em 4 colunas (~80px cada em 390px)

**2. `src/components/customize/AiFiltersList.tsx`**
- Linhas 172 e 185: trocar `grid-cols-3` por `grid-cols-4` nos grids de filtros
- Ajustar tamanhos de texto/badges se necessário para caber nos cards menores

### Resultado
- 2 arquivos modificados
- Cards de galeria e filtros em 4 colunas
- Mais conteúdo visível sem scroll

