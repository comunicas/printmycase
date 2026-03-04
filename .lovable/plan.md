

# Auto-selecionar endereço salvo no checkout

## Problema
Quando os endereços salvos são carregados no `AddressForm`, o componente apenas armazena a lista mas **nunca seleciona automaticamente** nenhum deles. Como `selectedAddressId` inicia como `null`, o formulário de novo endereço é sempre exibido — mesmo quando o usuário já tem endereços cadastrados.

## Correção

### Arquivo: `src/components/checkout/AddressForm.tsx`
No `useEffect` que carrega endereços (linhas 55-66), após `setAddresses(data)`, chamar `handleSelectAddress(data[0])` para auto-selecionar o primeiro endereço (que já vem ordenado por `is_default desc`).

```typescript
// Antes:
if (data && data.length > 0) {
  setAddresses(data);
}

// Depois:
if (data && data.length > 0) {
  setAddresses(data);
  handleSelectAddress(data[0]); // auto-seleciona o endereço padrão
}
```

Isso garante que, ao entrar no checkout com endereços já cadastrados, o primeiro (padrão) é automaticamente selecionado e o formulário de novo endereço fica oculto.

