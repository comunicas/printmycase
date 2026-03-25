

## Remover preload de imagem não utilizada

### Problema
A linha 35 do `index.html` faz preload de `/lovable-uploads/79379ce7-c6b3-4051-9947-c8dfc449251d.webp`, mas essa imagem não é referenciada em nenhum componente do app. Isso causa o warning do browser e desperdiça bandwidth.

### Alteração

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `index.html` | Remover a linha `<link rel="preload" as="image" href="/lovable-uploads/79379ce7-...webp" />` |

Alteração de 1 linha. Sem impacto funcional.

