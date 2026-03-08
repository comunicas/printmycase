

## Refatoração da Página de Moedas — UX de Alta Conversão

### Problemas atuais

1. **Saldo sem contexto** — número grande isolado, sem explicar para que servem as moedas nem quanto custa cada uso (filtro IA, upscale)
2. **Pacotes sem âncora de valor** — não mostram preço por moeda nem destacam o "melhor custo-benefício"
3. **Referral fraco** — bloco pequeno, sem destaque visual, sem explicar a recompensa do convidado
4. **Histórico sem filtro** — lista única misturando bônus, gastos e compras; sem separação visual
5. **Sem feedback de compra recém-concluída** — URL recebe `?purchased=100` mas nada acontece
6. **Preços hardcoded** — duplicação entre frontend (`PACKAGES`) e edge function (`COIN_PACKAGES`)
7. **Sem indicação de economia** — pacotes maiores não mostram desconto percentual

### Alterações propostas

**Arquivo: `src/pages/Coins.tsx`** (reescrita completa)

1. **Banner de saldo com contexto** — saldo grande + texto "Use para aplicar filtros IA nas suas capas" + link para o catálogo
2. **Toast de compra bem-sucedida** — ler `?purchased=X` da URL, exibir toast de sucesso e limpar o param
3. **Cards de pacotes com âncora de valor** — mostrar preço/moeda, badge "Mais popular" no de 500 e "Melhor valor" no de 5000, highlight visual no mais popular
4. **Seção referral destacada** — card com gradiente, ícone grande, texto claro sobre recompensa para ambos (quem indica e quem se cadastra), botão de copiar proeminente
5. **Histórico com tabs** — "Todos", "Ganhos" (amount > 0), "Gastos" (amount < 0) usando Tabs do Radix já instalado
6. **Badge "Expirado"** mais claro nos itens do histórico

**Arquivo: `src/hooks/useCoins.ts`**
- Sem mudanças

### Detalhes visuais

```text
┌──────────────────────────────┐
│  AppHeader (Moedas)          │
├──────────────────────────────┤
│      Seu saldo               │
│      🪙  350                 │
│  Use em filtros IA e mais    │
├──────────────────────────────┤
│  Comprar moedas              │
│  ┌──────┐ ┌─POPULAR─┐       │
│  │ 100  │ │  500    │       │
│  │R$9,90│ │R$39,90  │       │
│  │R$0,10│ │R$0,08/un│       │
│  └──────┘ └─────────┘       │
│  ┌──────┐ ┌─MELHOR──┐       │
│  │1.500 │ │  5.000  │       │
│  │R$99  │ │R$249,90 │       │
│  │R$0,07│ │R$0,05/un│       │
│  └──────┘ └─────────┘       │
├──────────────────────────────┤
│  🎁 Convide e ganhe!        │
│  Você ganha 50, amigo ganha │
│  50 moedas ao se cadastrar  │
│  [link...]        [Copiar]  │
├──────────────────────────────┤
│  Histórico                   │
│  [Todos] [Ganhos] [Gastos]   │
│  ...transações...            │
└──────────────────────────────┘
```

### Arquivos alterados
- `src/pages/Coins.tsx` — todas as mudanças acima

