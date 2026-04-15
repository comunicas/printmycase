

## Reprocessar o pedido pendente

### Problema
O evento `evt_1TMMzQDRRNUjjhDuSZJ4nYIK` do Stripe já está na tabela `stripe_webhook_events` (idempotência). Mesmo que o Stripe reenvie o webhook, o código vai detectar como duplicado e pular o processamento. A função `process_checkout_session_completed` agora existe, mas não será chamada.

### Solução
Uma migração SQL para:

1. **Deletar o registro de idempotência** do evento que falhou, permitindo reprocessamento
2. **Executar diretamente** a função `process_checkout_session_completed` para o session ID do pedido pendente, atualizando o status para `analyzing` e creditando o bônus de coins

```sql
-- Remover registro de idempotência do evento que falhou
DELETE FROM stripe_webhook_events 
WHERE event_id = 'evt_1TMMzQDRRNUjjhDuSZJ4nYIK';

-- Processar manualmente o pedido pendente
SELECT * FROM process_checkout_session_completed(
  'cs_live_b14lThg8HiCFk3bdkVnafeNK09xbn1hikacE0LVYcrGZkBGe97qjEFls2W',
  100,  -- bonus amount (default from coin_settings)
  30    -- bonus days (default from coin_settings)
);
```

### Resultado esperado
- O pedido `a3563f8e` muda de `pending` para `analyzing`
- O bônus de coins é creditado ao usuário
- O próximo retry do Stripe (se houver) poderá ser reprocessado normalmente

