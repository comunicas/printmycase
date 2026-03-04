

# Validação em tempo real (blur) no checkout

## Abordagem

Adicionar um estado `touched` por campo. Ao sair de cada campo (onBlur), marcar aquele campo como "touched". Mostrar erro inline quando o campo está touched OU submitted.

## Mudanças em `src/pages/Checkout.tsx`

1. **Novo estado `touched`** — objeto `Record<string, boolean>` com chaves: `zip`, `street`, `number`, `neighborhood`, `city`, `state`
2. **Helper `handleBlur(field)`** — seta `touched[field] = true`
3. **Condição de exibição de erro** — mudar de `submitted ? errors.X : undefined` para `(submitted || touched.X) ? errors.X : undefined`
4. **Adicionar `onBlur` em cada Input** — chamar `handleBlur` com o nome do campo correspondente
5. **Borda vermelha condicional** — ajustar className para usar `(submitted || touched.X)` em vez de apenas `submitted`

Nenhum novo componente ou dependência.

