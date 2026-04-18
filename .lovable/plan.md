

## Verificar ordenação no mobile (390x844)

Abrir o preview em viewport mobile na rota `/customize` e validar:

1. **Filtro Apple**: iPhones devem aparecer do 17 Pro Max → 17 Pro → 17 → 16 Pro Max → ... → 11.
2. **Filtro Samsung**: Galaxy do S24 Ultra → S24 → S23 → ... → A55 → ... → A05.

### Passos
1. `navigate_to_sandbox` com viewport 390x844 na URL `/customize`.
2. `screenshot` da view inicial (filtro "Todos").
3. `act` para clicar no chip "Apple" → `screenshot` para capturar a ordem dos iPhones (rolar se necessário).
4. `act` para clicar no chip "Samsung" → `screenshot` para capturar a ordem dos Galaxy.
5. Reportar a ordem observada vs. esperada. Se houver divergência, listar os modelos fora de ordem para ajuste do `SUFFIX_WEIGHT` ou da regex em `parseModel`.

### Sem alterações de código nesta etapa
Apenas validação visual. Caso encontre desvios (ex: "iPhone SE" sem número, "Galaxy A05s" mal pesado), proponho ajuste pontual no `SUFFIX_WEIGHT`/regex em `src/pages/SelectModel.tsx`.

