

## Melhorar espaçamento do Accordion FAQ

### Problema
O trigger (header) do accordion usa `px-5 py-4` e o conteúdo usa `px-5 pb-4` sem `pt`, resultando em pouco espaço entre a pergunta e a resposta quando aberto. O espaçamento entre itens (`space-y-3`) também é apertado.

### Alterações em `src/components/FaqSection.tsx`

1. **Trigger**: aumentar padding vertical de `py-4` para `py-5` — mais respiro no header
2. **Content div**: adicionar `pt-1` para criar separação visual entre pergunta e resposta, e aumentar `pb-4` para `pb-5`
3. **Accordion Root**: aumentar `space-y-3` para `space-y-4` — mais espaço entre itens
4. **Texto do trigger**: aumentar de `text-sm` para `text-base` para melhor legibilidade e proporção com o espaçamento

### Arquivo alterado
- `src/components/FaqSection.tsx`

