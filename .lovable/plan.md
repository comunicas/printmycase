

# Auto-preenchimento de endereço via ViaCEP

## Mudança

Quando o usuário digitar um CEP completo (8 dígitos) no campo de CEP do checkout, fazer uma chamada à API pública `https://viacep.com.br/ws/{cep}/json/` e preencher automaticamente os campos rua, bairro, cidade e estado.

## Implementação em `src/pages/Checkout.tsx`

1. **Na função `handleZipChange`**, quando `clean.length === 8`:
   - Fazer `fetch` para `https://viacep.com.br/ws/${clean}/json/`
   - Se retornar dados válidos (sem `erro: true`), preencher `street` (logradouro), `neighborhood` (bairro), `city` (localidade), `state` (uf), `complement` (complemento, se vier)
   - Limpar `selectedAddressId` para indicar endereço novo
   - Manter o cálculo de frete existente (`getShippingByZip`)

2. **Estado de loading** opcional: mostrar um spinner ou texto "Buscando..." no campo CEP enquanto a API responde

3. **Tratamento de erro**: se a API falhar ou retornar CEP inválido, não preencher nada — o usuário digita manualmente

Nenhuma nova dependência necessária — usa `fetch` nativo.

