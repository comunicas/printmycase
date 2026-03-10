

## Ajustar ordenação de marcas e produtos no catálogo

### Alterações em `src/pages/Catalog.tsx`

**1. Ordenar marcas com Apple e Samsung primeiro**
- Substituir o `.sort()` alfabético por uma ordenação com prioridade fixa: `["Apple", "Samsung"]` primeiro, depois o restante alfabeticamente.

**2. Ordenar produtos para mostrar modelos mais recentes primeiro**
- Dentro de cada marca, ordenar por nome de forma que números maiores (modelos mais recentes) apareçam primeiro. Ex: iPhone 16 antes de iPhone 14, Galaxy S25 antes de Galaxy S23.
- Aplicar uma função de sort que extrai o número do modelo do nome e ordena decrescente.

### Arquivo alterado
- `src/pages/Catalog.tsx` — lógica de `brands` e `filtered` no `useMemo`

