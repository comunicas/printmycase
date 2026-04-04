

## Redesign dos Cards de Pedidos — Resumo Compacto + Dialog de Detalhes

### Conceito

Transformar os cards de pedido de "tudo visível" para um padrão **resumo compacto + detalhe ao clicar**:

- **Card (lista)**: Mostra apenas o essencial — thumbnail, nome do produto, cliente, status badge colorido, valor total e data. Sem imagens de customização, sem input de rastreio, sem select de status. Uma linha limpa e clicável.
- **Dialog (detalhe)**: Ao clicar no card, abre um dialog completo com todas as informações e ações.

### Card Resumo (compacto)

Cada card na lista terá apenas:
```text
┌──────────────────────────────────────────────────┐
│ [img] Produto/Design · #abc123de    [Badge Status]│
│       👤 Cliente · Cidade/UF                      │
│       12 mar 2026, 14:30        R$ 132,80        │
└──────────────────────────────────────────────────┘
```
- Badge de status colorido (verde para entregue, azul para enviado, amarelo para produzindo, etc.)
- Cursor pointer, hover com borda destacada
- Sem `OrderImagesPreviewer`, sem input de rastreio, sem select de status

### Dialog de Detalhes Completo

Ao clicar, abre `OrderDetailDialog` com:

**1. Header**
- Produto/Design com imagem maior
- Badge de status + ID completo do pedido
- Data de criação formatada

**2. Seção "Cliente"**
- Nome completo
- Cidade/Estado

**3. Seção "Endereço de Entrega"**
- Rua, número, complemento
- Bairro, cidade, estado, CEP
- (extraído de `shipping_address` jsonb)

**4. Seção "Valores"**
- Subtotal do produto
- Frete
- Total

**5. Seção "Status e Rastreio"**
- Select para alterar status (com os mesmos handlers existentes)
- Input de código de rastreio + botão Salvar
- Timeline visual do status (usando `statusFlow` e `statusIcons` de constants.ts)

**6. Seção "Imagens de Customização"**
- `OrderImagesPreviewer` completo (Original, Otimizada, Recorte, Imagem Posição)

### Arquivos

1. **Criar** `src/components/admin/OrderDetailDialog.tsx`
   - Dialog com todas as seções acima
   - Recebe `order: OrderRow`, `open`, `onClose`, `onStatusChange`, `onSaveTracking`
   - Renderiza timeline de status, endereço completo, imagens

2. **Editar** `src/components/admin/OrdersManager.tsx`
   - Simplificar card para resumo compacto (remover OrderImagesPreviewer, input de rastreio, select de status do card)
   - Adicionar state `selectedOrder` e renderizar `OrderDetailDialog`
   - Adicionar badge de status colorido no card
   - Tornar card clicável com `onClick`

### Cores dos badges de status
- `pending` / `paid`: amarelo
- `analyzing` / `customizing`: azul
- `producing`: roxo
- `shipped`: indigo
- `delivered`: verde
- `cancelled`: vermelho

### Resultado
- Lista de pedidos muito mais limpa e rápida de escanear
- Todos os detalhes e ações ficam organizados no dialog
- Timeline visual do status dá contexto do progresso
- Endereço completo acessível sem precisar ir ao banco

