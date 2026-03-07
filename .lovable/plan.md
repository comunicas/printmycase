

## Correção dos Warnings de forwardRef

### Diagnóstico

Após análise, **nenhum dos 3 componentes mencionados** (ScrollReveal, AuthGuard, PendingCheckoutCards) usa `forwardRef` diretamente. Os warnings vêm de:

1. **`LoadingSpinner`** — usa `React.forwardRef` mas nenhum consumidor passa `ref` a ele. Pode ser simplificado.
2. **Bibliotecas externas (Radix UI, react-router-dom)** — emitem warnings de deprecação do `forwardRef` no React 18.3. Estes **não podem ser corrigidos** no código do projeto; só seriam resolvidos atualizando as bibliotecas.

### Alteração

**`src/components/ui/loading-spinner.tsx`** — Remover `React.forwardRef` e simplificar para componente funcional direto, eliminando o warning associado.

Nenhuma outra alteração é necessária nos 3 componentes mencionados, pois os warnings restantes são de dependências externas (Radix UI v1.x).

