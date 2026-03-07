

## Linha branca no topo do header

### Causa

Na `Landing.tsx` (linha 43), o container principal tem a classe `bg-background`:

```
<div className="min-h-screen bg-background flex flex-col">
```

O valor de `--background` no tema claro é `240 4% 95%` (cinza claro). Como o header usa `variant="transparent"` (sem fundo), essa cor de fundo do container aparece como uma linha/faixa clara atrás do header transparente, antes do hero escuro cobrir a área.

### Correção

Trocar `bg-background` por `bg-black` no wrapper da Landing, já que toda a página começa com o hero escuro. Isso elimina o contraste visível no topo. As seções abaixo do hero já definem seus próprios backgrounds, então não serão afetadas.

**Arquivo**: `src/pages/Landing.tsx` linha 43
- De: `className="min-h-screen bg-background flex flex-col"`
- Para: `className="min-h-screen bg-black flex flex-col"`

