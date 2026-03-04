

# Refinar feedback de validação no formulário de checkout

## Abordagem
Adicionar um estado `touched` que é ativado quando o usuário tenta submeter o formulário ou sai de um campo (blur). Cada campo obrigatório mostra erro inline em vermelho via a prop `error` do `FormField` já existente. O CEP também mostra erro quando incompleto.

## Mudanças em `src/pages/Checkout.tsx`

1. **Novo estado `submitted`** (boolean, default false) — setado `true` ao clicar "Finalizar Pedido"
2. **Computar erros por campo** com `useMemo`:
   - CEP: vazio → "CEP obrigatório", incompleto → "CEP incompleto", não permitido → "Região não atendida"
   - Rua: vazio → "Rua obrigatória"
   - Número: vazio → "Número obrigatório"
   - Bairro: vazio → "Bairro obrigatório"
   - Cidade: vazio → "Cidade obrigatória"
   - Estado: vazio → "Estado obrigatório"
3. **Passar `error` para cada `FormField`** condicionalmente quando `submitted` é true
4. **Remover o toast genérico** "Preencha o endereço completo" — o feedback inline substitui
5. **Aplicar borda vermelha nos inputs com erro** via className condicional `border-destructive`

Nenhum novo componente ou dependência necessários — usa a prop `error` do `FormField` que já renderiza `<p className="text-xs text-destructive">`.

