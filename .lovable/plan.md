

# Separar fluxo: Customização → Endereço/Checkout

## Visão geral

Criar uma nova página `/checkout/:id` que concentra endereço de entrega, cálculo de frete e resumo do pedido. A página `/customize/:id` fica focada apenas na personalização da imagem (upload, filtros, ajustes). O usuário finaliza a customização e clica "Continuar" para ir ao passo de endereço/checkout.

## Fluxo do usuário

```text
/product/:slug → /customize/:slug → /checkout/:slug → Stripe → /checkout/success
```

## Mudanças

### 1. Simplificar `/customize/:id` (`src/pages/Customize.tsx`)
- Remover toda a seção de frete (CEP, endereços, resumo de preço)
- Remover a lógica de `handleCheckout` e estados de shipping
- Botão muda de "Finalizar Pedido" para **"Continuar →"** que salva os dados de customização no `sessionStorage` e navega para `/checkout/:id`
- Dados salvos: `{ image (base64), imageFile name, scale, rotation, brightness, contrast, activeFilter, position }`

### 2. Criar página `/checkout/:id` (`src/pages/Checkout.tsx`)
- Recupera dados de customização do `sessionStorage`
- Mostra mini-preview da capa customizada (thumbnail)
- **Formulário de endereço completo**: rua, número, complemento, bairro, cidade, estado, CEP — usando os componentes `FormField` e `FormCard` existentes
- Opção de selecionar endereço salvo (se logado e tiver endereços)
- Opção de salvar endereço para próximas compras (checkbox)
- Cálculo de frete automático pelo CEP (reutiliza `getShippingByZip`)
- Resumo: produto + frete + total
- Botão "Finalizar Pedido" com a lógica de checkout atual (upload imagem + chamar `create-checkout`)

### 3. Registrar rota (`src/App.tsx`)
- Adicionar `<Route path="/checkout/:id" element={<AuthGuard><Checkout /></AuthGuard>} />`

### 4. Atualizar edge function `create-checkout`
- Aceitar endereço inline (campos do formulário) além de `address_id`
- Se o usuário optou por salvar, inserir na tabela `addresses` antes de criar a order

## Detalhes técnicos

- Dados de customização passados via `sessionStorage` (evita props complexos e funciona com refresh)
- A imagem em File será re-selecionada ou mantida como base64 no sessionStorage (com limite de tamanho razoável)
- Formulário de endereço usa máscaras existentes (`maskCEP`) e validação client-side
- Componentes reutilizados: `FormField`, `FormCard`, `SubmitButton`, `AppHeader`

