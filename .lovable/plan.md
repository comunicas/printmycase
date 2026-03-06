

## Correção: Botão "Continuar" quebrado no desktop

### Problema
No desktop (`lg:`), o `ContinueBar` renderiza um `div` com `max-w-xs` sem centralização, ficando colado na esquerda da tela. Ele é filho direto do container flex-col raiz, mas não tem `self-center` nem margem automática.

### Solução
Unificar o layout do `ContinueBar` para que no desktop o botão fique centralizado abaixo dos controles, consistente com o restante da interface:

- Adicionar `mx-auto` ou `self-center` ao wrapper desktop para centralizar horizontalmente
- Adicionar padding vertical (`py-3`) ao wrapper desktop para espaçamento consistente com mobile

Edição em um único arquivo: `src/components/customize/ContinueBar.tsx`, linha 32 — adicionar classes de centralização ao div desktop.

