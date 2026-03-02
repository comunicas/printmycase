

# Correcao de Erros nas Edge Functions e Proximos Passos

## Problemas Encontrados nos Logs

### 1. Edge Function `stripe-webhook` — Erro critico
O Stripe SDK no Deno exige o metodo **assincrono** para verificar assinaturas de webhook:
```
SubtleCryptoProvider cannot be used in a synchronous context.
Use `await constructEventAsync(...)` instead of `constructEvent(...)`
```
**Solucao:** Trocar `stripe.webhooks.constructEvent(...)` por `await stripe.webhooks.constructEventAsync(...)`.

### 2. Edge Function `create-checkout` — Erro de runtime
```
Deno.core.runMicrotasks() is not supported in this environment
```
Isso e causado pela versao do Stripe SDK importada via esm.sh com polyfills Node incompativeis. 
**Solucao:** Usar o import do Stripe otimizado para Deno: `https://esm.sh/stripe@17.7.0?target=deno&no-check&no-dts` (adicionando `no-dts`) ou pinando uma versao mais estavel.

### 3. Triggers SQL nao foram criados
A configuracao mostra que os triggers `on_auth_user_created` e `on_profiles_updated` **nao existem** no banco, apesar da migracao. Precisam ser recriados.

## Plano de Implementacao

### Passo 1: Corrigir `stripe-webhook`
- Trocar `constructEvent` por `constructEventAsync` (com `await`)
- Ajustar o import do Stripe para evitar erro de runtime

### Passo 2: Corrigir `create-checkout`
- Ajustar o import do Stripe para `https://esm.sh/stripe@17.7.0?target=deno&no-check&no-dts`
- Garantir que o SDK funcione sem o polyfill Node problemático

### Passo 3: Recriar triggers SQL
Migracao para criar os dois triggers pendentes:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### Passo 4: Reimplantar as edge functions
Apos as correcoes, reimplantar ambas as functions para que as mudancas entrem em vigor.

## Detalhes Tecnicos

| Componente | Problema | Correcao |
|---|---|---|
| `stripe-webhook` | `constructEvent` sincrono | Usar `constructEventAsync` |
| `create-checkout` | `runMicrotasks` nao suportado | Ajustar import esm.sh |
| Triggers SQL | Nao existem no banco | Recriar via migracao |

