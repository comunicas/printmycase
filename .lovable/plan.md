

## Ordenar modelos da versão mais nova para mais antiga

Atualmente em `src/pages/SelectModel.tsx` o sort é alfabético (`a.name.localeCompare(b.name)`), o que faz "Galaxy A05" aparecer antes do "Galaxy S24", e "iPhone 11" antes do "iPhone 16".

### Solução

Substituir o sort alfabético por um sort que extrai o número de versão do nome e ordena descendente (mais novo primeiro). Modelos com sufixos (Pro, Pro Max, Plus, Ultra, FE, s) ficam agrupados pela versão e ordenados internamente por relevância.

### Lógica de ordenação

Para cada produto:
1. Extrair o número principal (ex: "iPhone 16 Pro Max" → 16, "Galaxy S24 Ultra" → 24, "Galaxy A05s" → 5).
2. Extrair peso do sufixo (Ultra/Pro Max > Pro > Plus > FE > base > "s"/"e" lite).
3. Ordenar por: marca prioritária → número desc → peso do sufixo desc → nome.

```ts
const SUFFIX_WEIGHT: Record<string, number> = {
  "ultra": 5, "pro max": 4, "pro": 3, "plus": 2, "max": 2,
  "fe": 1, "": 0, "s": -1, "e": -1, "mini": -2,
};

function parseModel(name: string) {
  const clean = name.replace(/^Capa\s+/i, "");
  const numMatch = clean.match(/(\d+)/);
  const version = numMatch ? parseInt(numMatch[1], 10) : 0;
  const afterNum = numMatch ? clean.slice(numMatch.index! + numMatch[0].length).trim().toLowerCase() : "";
  const suffix = afterNum.replace(/[^a-z\s]/g, "").trim();
  const weight = SUFFIX_WEIGHT[suffix] ?? 0;
  return { version, weight };
}
```

Sort final dentro do `useMemo` de `filtered`:
```ts
return [...list].sort((a, b) => {
  const A = parseModel(a.name);
  const B = parseModel(b.name);
  if (B.version !== A.version) return B.version - A.version;
  if (B.weight !== A.weight) return B.weight - A.weight;
  return a.name.localeCompare(b.name);
});
```

### Resultado esperado

- **Apple**: iPhone 17 Pro Max → 17 Pro → 17 → 16 Pro Max → 16 → ... → 11
- **Samsung**: Galaxy S24 Ultra → S24 → S23 → ... → A55 → A35 → ... → A05s → A05

### Arquivos

- `src/pages/SelectModel.tsx`: 1 arquivo, ~15 linhas (helper + sort).

