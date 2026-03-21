

## Logs e Correções nas Integrações Stripe

### Problemas Encontrados

**1. Falta de logs detalhados em todas as 3 functions Stripe**
- `create-checkout`: só loga erros do Stripe e do catch final
- `create-coin-checkout`: só loga no catch final
- `stripe-webhook`: tem logs básicos mas não loga metadata/session_id recebidos
- Nenhuma function loga o payload enviado ao Stripe, IDs criados, ou resultados de operações no banco

**2. `ALLOWED_ORIGINS` desatualizado**
- Ambas `create-checkout` e `create-coin-checkout` usam `printmycase.com.br` como origem permitida
- O domínio real da aplicação é `studio.printmycase.com.br`
- Resultado: redirects de sucesso/cancelamento vão para o domínio errado (sem `studio.`)

**3. `create-coin-checkout` usa Stripe SDK (npm import) vs `create-checkout` usa REST API**
- Inconsistência de abordagem, mas funcional. O SDK importa ~500KB desnecessários

**4. Webhook não loga erros de operações no banco**
- `insert` e `update` no banco não verificam retorno de erro
- Se o insert de `coin_transactions` falhar, o webhook retorna 200 sem saber que falhou

### Plano de Correções

**1. `supabase/functions/create-checkout/index.ts`**
- Adicionar `studio.printmycase.com.br` ao `ALLOWED_ORIGINS`
- Logs: `[checkout] userId, productId, designId, isCollection, totalCents`
- Log após criar sessão Stripe: `[stripe-session] id, url`
- Log após inserir order: `[order] orderId`
- Log de erros do banco com detalhes

**2. `supabase/functions/create-coin-checkout/index.ts`**
- Adicionar `studio.printmycase.com.br` ao `ALLOWED_ORIGINS`
- Logs: `[coin-checkout] userId, coins, priceCents`
- Log após criar sessão: `[stripe-session] id`
- Verificar erro do Stripe session e logar

**3. `supabase/functions/stripe-webhook/index.ts`**
- Log ao receber evento: `[webhook] event.type, session.id`
- Log de metadata: `[metadata] type, userId, productId, coinAmount`
- Verificar e logar erros das operações no banco (insert/update)
- Log após cada operação: `[db] order updated, coins credited`
- Log no caso `checkout.session.expired`: `[expired] session.id`

### Resultado
- Logs estruturados em todas as 3 functions para rastrear fluxo completo
- URLs de redirect corretas para `studio.printmycase.com.br`
- Erros silenciosos no webhook detectados e logados

