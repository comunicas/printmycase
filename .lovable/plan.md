

## Corrigir formatação de valores no UserDetailDialog

### Problema
Na `UserDetailDialog.tsx`, linha 134, `formatPrice(o.total_cents)` não divide por 100, então 13280 centavos aparece como R$ 13.280,00 em vez de R$ 132,80. Todos os outros locais do código fazem `formatPrice(valor / 100)` corretamente.

### Correção
**1 arquivo editado: `src/components/admin/UserDetailDialog.tsx`**
- Linha 134: trocar `formatPrice(o.total_cents)` por `formatPrice(o.total_cents / 100)`

Isso é a única ocorrência incorreta em todo o codebase. Todos os demais usos de `formatPrice` já dividem centavos por 100 antes de formatar.

