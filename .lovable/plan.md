

## Truncar nomes de filtro longos nos badges de IA

### O que muda

Criar uma função helper `truncateFilter` que limita o texto a 20 caracteres + "…" e aplicá-la em todos os pontos onde `filter_name` é exibido.

### Arquivos alterados

**1. `src/components/AiCoinsSection.tsx`** (3 ocorrências)
- Linha 116: hover badge desktop → `truncateFilter(img.filter_name)`
- Linha 124: mobile badge → `truncateFilter(img.filter_name)`

**2. `src/components/AiGalleryModal.tsx`** (3 ocorrências)
- Linha 105: hover badge desktop → `truncateFilter(img.filter_name)`
- Linha 113: mobile badge → `truncateFilter(img.filter_name)`

### Helper (inline em cada arquivo ou num utils)

```typescript
const truncateFilter = (name: string, max = 20) =>
  name.length > max ? name.slice(0, max) + "…" : name;
```

Adicionado como função local no topo de cada componente. Simples e sem dependências.

