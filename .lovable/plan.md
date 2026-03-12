

## Infinite Scroll na Lista de Gerações IA

### Alteração

**`src/components/admin/AiGenerationsManager.tsx`**

- Carregar imagens em lotes de 12 (`PAGE_SIZE = 12`)
- Usar `useRef` + `IntersectionObserver` num elemento sentinela no final do grid
- Quando o sentinela ficar visível, carregar próximo lote via `.range(from, to)` no query
- Estado `hasMore` para parar de observar quando não houver mais registros
- Ao gerar nova imagem (`onGenerated`), resetar para página 1 e recarregar
- Ao deletar, remover do estado local (sem recarregar tudo)
- Loading spinner inline no final do grid enquanto carrega mais

### Fluxo

1. `fetchImages(reset?)` — se reset, limpa array e começa do 0; senão, appenda ao array existente
2. Query usa `.range(offset, offset + PAGE_SIZE - 1)`
3. Se `data.length < PAGE_SIZE`, seta `hasMore = false`
4. Sentinela `<div ref={sentinelRef} />` após o grid, observado pelo IntersectionObserver
5. Observer dispara `fetchMore` quando visível e `hasMore && !loading`

