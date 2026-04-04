

## Corrigir Warning de forwardRef no SortIcon

### Problema
O console mostra warning "Function components cannot be given refs" para o componente `SortIcon` dentro de `UsersManager.tsx` (linha 177). Isso acontece porque `SortIcon` é um componente funcional usado como filho direto de `TableHead` (que é um componente Radix/forwardRef e tenta passar ref).

### Correção

**1 arquivo editado: `src/components/admin/UsersManager.tsx`**

- Converter `SortIcon` de componente funcional inline para uma função helper simples que retorna JSX (não um componente React):
  ```tsx
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 inline opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 inline text-primary" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 inline text-primary" />;
  };
  ```
- Atualizar todos os usos de `<SortIcon col="..." />` para `{renderSortIcon("...")}` no JSX

Isso elimina o warning porque uma chamada de função não recebe refs, diferente de um componente React.

