

# Desabilitar envio fora do Sudeste temporariamente

## Abordagem
Adicionar um flag na lógica de shipping que restringe pedidos apenas à região Sudeste. Quando o CEP informado não pertence ao Sudeste, mostrar mensagem informativa e desabilitar o botão "Finalizar Pedido".

## Implementação

### `src/lib/shipping.ts`
- Exportar constante `ALLOWED_REGIONS = ["Sudeste"]` (fácil de alterar depois)
- Adicionar campo `allowed: boolean` no `ShippingResult`
- `getShippingByZip` retorna `allowed: false` quando a região não está em `ALLOWED_REGIONS`

### `src/pages/Customize.tsx`
- Verificar `shipping.allowed` antes de habilitar o botão de checkout
- Quando `allowed === false`, mostrar alerta: "No momento, realizamos envios apenas para a região Sudeste (SP, RJ, MG, ES)."
- Botão "Finalizar Pedido" fica `disabled` quando frete não é permitido

