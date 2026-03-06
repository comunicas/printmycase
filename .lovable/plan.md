

## Plano: Adicionar botão de reset na versão desktop

### Problema
O botão de resetar ajustes (RotateCcw) só aparece na barra inferior mobile (`lg:hidden`). Na versão desktop não existe nenhum botão equivalente.

### Solução

**`src/pages/Customize.tsx`** — Adicionar o botão de reset na seção desktop (linhas 343-352):

- Envolver o botão "Continuar" desktop em um `flex` com gap
- Adicionar o botão `RotateCcw` à esquerda do "Continuar", visível apenas quando `isModified` é true
- Mesma lógica e estilo do mobile: `variant="ghost"`, `size="icon"`, chama `handleReset`

### Resultado
Desktop terá a mesma experiência do mobile: botão de reset aparece quando há modificações (zoom, posição, rotação ou filtro) e desaparece quando não há.

### Arquivo alterado
- `src/pages/Customize.tsx`

