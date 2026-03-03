

# Melhorar performance e feedback da alteração em massa

## Problema
O `BulkPriceDialog` processa produtos sequencialmente: para cada produto faz 1 PATCH no DB + 1 chamada ao edge function `admin-sync-stripe`. Com 73 produtos, isso gera ~146 requests sequenciais, sem feedback visual.

## Solucoes propostas

### 1. Barra de progresso no dialog
Adicionar uma progress bar que mostra `X de Y` produtos processados durante a aplicacao.

### 2. Processamento paralelo em lotes (batches)
Em vez de processar 1 produto por vez, processar em lotes de 5 produtos simultaneamente usando `Promise.all`. Isso reduz o tempo total em ~5x.

### 3. Separar DB update do Stripe sync
Fazer todos os updates no DB primeiro (rapido), depois sincronizar Stripe em paralelo. Isso da feedback mais rapido ao usuario.

## Implementacao

### `src/components/admin/BulkPriceDialog.tsx`
- Adicionar estado `progress: { current: number; total: number } | null`
- Substituir o loop `for...of` por processamento em batches de 5
- Mostrar progress bar durante aplicacao (div com width percentual + texto "X de Y")
- Fase 1: batch update DB (rapido)
- Fase 2: batch sync Stripe (mais lento, so para produtos com `stripe_product_id`)

## Arquivo afetado
- `src/components/admin/BulkPriceDialog.tsx`

