

# Extrair formulário de endereço em componente separado

## Novo arquivo: `src/components/checkout/AddressForm.tsx`

Criar um componente `AddressForm` que encapsula toda a lógica e UI de endereço atualmente no Checkout (linhas 38-51, 54-156, 258-368).

### O componente recebe via props:
- `shipping` / `onShippingChange` — resultado do cálculo de frete
- `submitted` — para controlar exibição de erros
- `onAddressChange(data)` — callback que passa os dados do endereço para o pai (`street`, `number`, `complement`, `neighborhood`, `city`, `state`, `zipInput`, `addressLabel`, `saveAddress`, `selectedAddressId`)

### O componente gerencia internamente:
- Estados dos campos (`street`, `number`, `complement`, `neighborhood`, `city`, `state`, `zipInput`, `addressLabel`, `saveAddress`)
- Estado `touched` e `handleBlur`
- `selectedAddressId` e lista de `addresses` (carregadas do banco)
- `zipLoading` e chamada ViaCEP em `handleZipChange`
- `errors` memoizados e helpers `showError`/`hasError`
- Seção de endereços salvos + botão "Novo endereço"
- FormCard com todos os inputs

### O componente expõe via `useImperativeHandle` (ou callback):
- `getAddressData()` — retorna os dados atuais do endereço para o checkout
- `isValid` — se o formulário está válido (para controlar o botão "Finalizar")

### Abordagem simplificada (preferida):
Usar um padrão de **controlled component** onde `AddressForm` chama `onAddressChange` sempre que um campo muda, passando todos os dados necessários para o `Checkout` construir o payload. O `Checkout` mantém apenas `shipping` e `isAddressValid` como estado derivado.

## Mudanças em `src/pages/Checkout.tsx`

- Remover ~120 linhas de estado/lógica de endereço
- Importar e renderizar `<AddressForm>`
- Receber dados de endereço via callback para usar no `handleCheckout`

