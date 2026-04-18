

## Remover filtro "Todos"

Em `src/pages/SelectModel.tsx`, remover a opção "Todos" dos chips de marca e definir a marca padrão como a primeira disponível (Apple, por prioridade).

### Mudanças em `src/pages/SelectModel.tsx`

1. **Estado inicial**: trocar `useState("Todos")` por `useState("")` e setar a primeira marca via `useEffect` quando `brands` carregar (ou usar `useMemo` derivado).
2. **brands useMemo**: remover o `["Todos", ...sorted]` → retornar apenas `sorted`.
3. **filtered useMemo**: remover o branch `if (selectedBrand !== "Todos")` — sempre filtra pela marca selecionada.
4. **Contador de chip**: remover o caso especial `brand === "Todos" ? products.length`.
5. **hasActiveFilters / clearFilters**: ajustar para considerar apenas `search` (já que sempre há marca selecionada). `clearFilters` limpa só a busca; manter botão "Limpar" só quando há texto de busca.
6. **Texto de contagem**: simplificar para `${filtered.length} modelos` (ou `${filtered.length} de N` quando houver busca).

### Detalhe de inicialização

Para evitar render vazio antes do `products` carregar:
```ts
const [selectedBrand, setSelectedBrand] = useState<string>("");
useEffect(() => {
  if (!selectedBrand && brands.length > 0) setSelectedBrand(brands[0]);
}, [brands, selectedBrand]);
```

### Arquivos
- `src/pages/SelectModel.tsx` — 1 arquivo, ~10 linhas alteradas.

