

## Corrigir erro de checkout: secret ausente

### Problema
O checkout está falhando com o erro `CHECKOUT_SUCCESS_TOKEN_SECRET not configured`. Essa secret é necessária para gerar um token seguro na URL de sucesso do Stripe, mas nunca foi adicionada ao ambiente.

Log capturado:
```
[checkout] Unhandled error: CHECKOUT_SUCCESS_TOKEN_SECRET not configured
```

### Solução
Adicionar a secret `CHECKOUT_SUCCESS_TOKEN_SECRET` com um valor aleatório seguro (UUID ou string longa). Essa secret é usada em duas edge functions:
- `create-checkout` — gera o token na URL de sucesso
- `get-success-order` — valida o token ao exibir a página de sucesso

### Alteração
1. Usar a ferramenta `add_secret` para configurar `CHECKOUT_SUCCESS_TOKEN_SECRET` com um valor gerado automaticamente (ex: UUID v4)

Nenhuma alteração de código necessária — apenas a configuração da secret resolve o bloqueio.

