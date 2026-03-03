

# Frete fixo por região + rastreio de pedido

## Resumo
Implementar tabela de frete fixo por região do Brasil, exibir o cálculo no checkout baseado no CEP do endereço do usuário, somar ao total do pedido, e adicionar campo de código de rastreio nos pedidos para que o usuário acompanhe a entrega.

## Tabela de frete por região

| Região | Estados | Valor |
|--------|---------|-------|
| Sudeste | SP, RJ, MG, ES | R$ 12,90 |
| Sul | PR, SC, RS | R$ 15,90 |
| Centro-Oeste | GO, MT, MS, DF | R$ 18,90 |
| Nordeste | BA, SE, AL, PE, PB, RN, CE, PI, MA | R$ 22,90 |
| Norte | AM, PA, AC, RO, RR, AP, TO | R$ 27,90 |

Esses valores ficarão numa constante no código (fácil de trocar por API depois).

## O que será feito

### 1. Migração: adicionar campos na tabela `orders`
- `shipping_cents` (integer, nullable) — valor do frete cobrado
- `tracking_code` (text, nullable) — código de rastreio (preenchido pelo admin depois)
- `shipping_address` (jsonb, nullable) — snapshot do endereço usado

### 2. Criar mapa CEP→região no frontend
- Arquivo `src/lib/shipping.ts` com função `getShippingByZip(zip: string)` que retorna o valor em centavos baseado nos 2 primeiros dígitos do CEP
- Exportar constantes para reutilização

### 3. Atualizar página de customização (`Customize.tsx`)
- Antes de "Finalizar Pedido", mostrar um mini-resumo:
  - Seletor de endereço (ou input de CEP) para calcular frete
  - Exibir: Produto R$ XX + Frete R$ YY = Total R$ ZZ
- Enviar `shipping_cents` e `address_id` no body do `create-checkout`

### 4. Atualizar edge function `create-checkout`
- Receber `shipping_cents` e `address_id` no body
- Adicionar o frete como segundo `line_item` no Stripe (com nome "Frete")
- Salvar `shipping_cents`, `address_id` e snapshot do endereço no pedido

### 5. Atualizar página de pedidos (`Orders.tsx`)
- Mostrar valor do frete separado
- Se `tracking_code` existir, exibir link clicável para rastreio nos Correios (`https://rastreamento.correios.com.br/app/index.php`)

### 6. Admin: permitir adicionar código de rastreio
- Na página `/admin` ou numa futura página de gestão de pedidos, o admin poderá inserir o `tracking_code` via update na tabela `orders`
- Adicionar RLS policy para admins poderem atualizar pedidos

## Arquivos afetados
- **Migração SQL**: adicionar colunas `shipping_cents`, `tracking_code`, `shipping_address` em `orders` + RLS policy de update para admins
- **Criar**: `src/lib/shipping.ts` (mapa CEP→região→valor)
- **Editar**: `src/pages/Customize.tsx` (resumo de frete + seletor de endereço/CEP)
- **Editar**: `supabase/functions/create-checkout/index.ts` (line item de frete + salvar dados)
- **Editar**: `src/pages/Orders.tsx` (exibir frete + rastreio)
- **Editar**: `src/pages/Admin.tsx` (input de código de rastreio nos pedidos)

