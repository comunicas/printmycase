

## Plano: Atualizar saldo de coins em tempo real + simplificar botão

### Problema
O `CoinBalance` no header e o `useCoins()` dentro do `useCustomize` são instâncias separadas do hook. Quando `refreshCoins()` é chamado após filtro/upscale, apenas a instância do hook interno atualiza — o saldo visível no header permanece desatualizado.

### Alterações

**1. `src/hooks/useCoins.ts` — Sincronização global via custom event**
- Após `refresh()`, disparar `window.dispatchEvent(new Event("coins-updated"))`
- Adicionar listener no hook para que todas as instâncias reajam ao evento e re-fetch automaticamente
- Isso garante que o `CoinBalance` no header atualize quando `refreshCoins()` é chamado no useCustomize

**2. `src/hooks/useCustomize.tsx` — Estimular compra quando saldo ficar baixo**
- Após filtro/upscale bem-sucedido, verificar se o saldo resultante é menor que o custo mínimo (filtro ou upscale)
- Se sim, exibir toast com ação incentivando compra de moedas ou indicação:
  - Título: "Suas moedas estão acabando!"
  - Descrição: "Compre mais ou indique amigos para ganhar moedas grátis."
  - Ações: links para `/coins` (compra) e seção de indicação

**3. `src/components/customize/ContinueBar.tsx` — Simplificar botão**
- Remover `productName` e `priceCents` do conteúdo do botão
- Manter apenas "Finalizar" com a seta
- Props `productName` e `priceCents` podem ser removidas da interface

### Arquivos alterados
- `src/hooks/useCoins.ts`
- `src/hooks/useCustomize.tsx`
- `src/components/customize/ContinueBar.tsx`

