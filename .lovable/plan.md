

## Justificativa Obrigatória ao Recusar Imagem + Notificação ao Usuário

### Mudanças

**1. Adicionar coluna `rejection_reason` na tabela `orders`**
- Migration: `ALTER TABLE orders ADD COLUMN rejection_reason text;`
- Armazena o motivo da recusa preenchido pelo admin

**2. Editar `OrderDetailDialog.tsx`**
- Interceptar mudança de status no `<select>`: quando o valor selecionado for `rejected`, em vez de chamar `onStatusChange` diretamente, exibir um campo de texto (textarea) obrigatório para justificativa
- Adicionar states: `pendingStatus`, `rejectionReason`, `showRejectForm`
- Botão "Confirmar Recusa" que chama `onStatusChange(orderId, "rejected", rejectionReason)`
- Atualizar a interface `Props.onStatusChange` para aceitar um terceiro parâmetro opcional `reason?: string`

**3. Editar `OrdersManager.tsx`**
- Atualizar `handleStatusChange` para receber `reason?: string` e salvar `rejection_reason` junto com o status
- Passar `rejection_reason` no body do `notify-order-status`

**4. Editar `notify-order-status/index.ts`**
- Aceitar `rejection_reason` no body
- Passar para `templateData` como `rejectionReason`

**5. Editar `order-status-update.tsx` (template de email)**
- Adicionar labels para `rejected` nos maps de status/cores
- Quando `newStatus === 'rejected'` e `rejectionReason` existir, exibir seção com o motivo da recusa no email

**6. Exibir motivo na `OrderDetailDialog`**
- Quando o pedido já estiver com status `rejected`, mostrar o `rejection_reason` salvo abaixo da indicação "Imagem recusada"

### Arquivos
- 1 migration (adicionar coluna)
- `OrderDetailDialog.tsx` — form de justificativa + exibição do motivo
- `OrdersManager.tsx` — salvar reason no update
- `notify-order-status/index.ts` — passar reason no email
- `order-status-update.tsx` — renderizar motivo no email

