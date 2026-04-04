

## Exibir Motivo da Recusa na Área "Meus Pedidos" do Cliente

### Mudanças

**1 arquivo editado: `src/pages/Orders.tsx`**

- No componente `OrderProgress`, adicionar tratamento para status `rejected` (similar ao `cancelled`): exibir badge laranja/vermelho com ícone e label "Imagem Recusada"
- No card do pedido, quando `order.status === "rejected"` e `order.rejection_reason` existir, exibir uma caixa de alerta abaixo do status com o motivo da recusa
- Adicionar `rejection_reason` ao tipo `OrderWithProduct` (já vem do select `*` na tabela orders)
- Adicionar `"rejected"` ao array `activeStatuses` para que pedidos recusados apareçam na tab "Ativos"

### Visual
```text
┌─ Card do pedido ─────────────────────────┐
│  [img] Nome do produto     R$ 132,80     │
│         12 de março de 2026              │
│                                          │
│  ⛔ Imagem Recusada                      │
│  ┌─ alerta laranja ──────────────────┐   │
│  │ Motivo: "A imagem está com        │   │
│  │ resolução muito baixa..."         │   │
│  └───────────────────────────────────┘   │
│  🕐 Prazo: 5 a 7 dias úteis             │
└──────────────────────────────────────────┘
```

