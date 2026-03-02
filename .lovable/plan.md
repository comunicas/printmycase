

# Fase 3: Checkout com Stripe, Salvamento de Customizacao e Pagina de Pedidos

## Visao Geral

Esta fase conecta o fluxo de customizacao ao pagamento via Stripe e adiciona uma area para o usuario acompanhar seus pedidos. A imagem customizada sera salva no storage do backend e os dados da customizacao persistidos na tabela `orders`.

## Passo 1: Habilitar Stripe

Antes de qualquer codigo, precisamos ativar a integracao Stripe no projeto. Isso vai:
- Solicitar sua chave secreta do Stripe
- Desbloquear ferramentas e contexto adicional para implementar checkout

**Voce precisara da sua Secret Key do Stripe** (encontrada em https://dashboard.stripe.com/apikeys).

## Passo 2: Corrigir Triggers Pendentes (SQL)

Os triggers da Fase 1 ainda nao foram conectados. Migracao necessaria:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Passo 3: Storage para Imagens

Criar um bucket `customizations` no storage do backend para salvar as imagens customizadas dos usuarios. Isso permite que a imagem sobreviva apos o checkout e possa ser usada para producao.

## Passo 4: Edge Function — Criar Sessao de Checkout

Criar `supabase/functions/create-checkout/index.ts`:
- Recebe: `product_id`, `customization_data` (filtros, escala, rotacao, posicao), `image_url` (URL do storage)
- Valida autenticacao via `getClaims()`
- Cria um produto Stripe com o preco da capa (R$ 69,90 = 6990 centavos)
- Cria uma Checkout Session em modo `payment`
- Insere um registro na tabela `orders` com status `pending`
- Retorna a URL do Stripe Checkout

## Passo 5: Edge Function — Webhook do Stripe

Criar `supabase/functions/stripe-webhook/index.ts`:
- Endpoint publico (sem JWT) que recebe eventos do Stripe
- Valida a assinatura do webhook
- Evento `checkout.session.completed`: atualiza o status do pedido para `paid`
- Evento `checkout.session.expired`: atualiza para `cancelled`

## Passo 6: Atualizar Pagina de Customizacao

Modificar `src/pages/Customize.tsx`:
- Botao "Finalizar Pedido" agora:
  1. Faz upload da imagem para o storage
  2. Chama a edge function `create-checkout`
  3. Redireciona o usuario para a URL do Stripe Checkout
- Botao "Salvar Rascunho" salva os dados no `localStorage` por enquanto

## Passo 7: Pagina de Sucesso do Checkout

Criar `src/pages/CheckoutSuccess.tsx`:
- Exibe confirmacao do pedido
- Mostra resumo: nome do produto, preview da customizacao
- Botao para ver pedidos e botao para voltar ao catalogo

## Passo 8: Pagina de Pedidos (Minha Conta)

Criar `src/pages/Orders.tsx`:
- Lista todos os pedidos do usuario (da tabela `orders`)
- Cada pedido mostra: nome do produto, data, status (com badge colorido), valor
- Protegida com `AuthGuard`

## Passo 9: Atualizar Rotas e Navegacao

- Adicionar rotas: `/checkout/success`, `/orders`
- Adicionar link "Meus Pedidos" no `UserMenu`
- Proteger `/orders` com `AuthGuard`

---

## Detalhes Tecnicos

- **Preco**: Todos os produtos custam R$ 69,90 (6990 centavos). O preco e definido server-side na edge function, nao confiando no frontend.
- **Storage**: Imagens salvas como `customizations/{user_id}/{timestamp}.png`
- **Stripe mode**: `payment` (pagamento unico). Assinaturas ficam para uma fase futura.
- **Webhook secret**: Sera necessario configurar o webhook no Stripe Dashboard apontando para a URL da edge function.
- **RLS**: A tabela `orders` ja tem politicas para SELECT e INSERT do proprio usuario. O webhook usara `SUPABASE_SERVICE_ROLE_KEY` para atualizar status.

## Ordem de Implementacao

```text
1. Habilitar Stripe (ferramenta do Lovable)
2. Migracao SQL (triggers)
3. Criar bucket de storage
4. Criar edge function create-checkout
5. Criar edge function stripe-webhook
6. Atualizar Customize.tsx com fluxo de checkout
7. Criar CheckoutSuccess.tsx
8. Criar Orders.tsx
9. Atualizar App.tsx e UserMenu com novas rotas
```

