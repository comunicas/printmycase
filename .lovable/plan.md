

## Corrigir botão voltar na página "Selecione seu modelo"

### Problema
O botão usa `navigate(-1)` que depende do histórico do navegador. Se o usuário acessou `/customize` diretamente (link, bookmark, refresh), não há página anterior — o botão não faz nada.

### Correção
**`src/pages/SelectModel.tsx` — linha 62**
- Trocar `navigate(-1)` por `navigate("/")`
- Isso garante que o botão sempre leva à home

### Arquivo afetado
- `src/pages/SelectModel.tsx` — 1 linha

