

## Atualizar STRIPE_WEBHOOK_SECRET

O secret `STRIPE_WEBHOOK_SECRET` já existe no projeto. Vou usar a ferramenta de adicionar secret para solicitar que você insira o novo signing secret (`whsec_...`) do webhook endpoint de produção.

### Ação
1. Solicitar input seguro do novo `STRIPE_WEBHOOK_SECRET` via ferramenta de secrets
2. O valor será atualizado automaticamente e ficará disponível para a edge function `stripe-webhook`

Nenhuma alteração de código é necessária — apenas a atualização do valor do secret.

