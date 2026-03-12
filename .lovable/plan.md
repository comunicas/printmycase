

## Corrigir loop infinito no AddressForm + verificar checkout

### Problema
O `handleAddressChange` em `DesignPage.tsx` (linha 57-60) nao usa `useCallback`, criando nova referencia a cada render. O `AddressForm` inclui `onAddressChange` nas deps do `useCallback` (linha 93), que dispara o `useEffect` (linha 95-97), chamando `onAddressChange` → setState no parent → re-render → nova ref → loop infinito.

### Correção

| Arquivo | Mudança |
|---|---|
| `src/pages/DesignPage.tsx` | Envolver `handleAddressChange` em `useCallback` para estabilizar a referencia |

```typescript
// DesignPage.tsx - linha ~57
const handleAddressChange = useCallback((data: AddressData, valid: boolean) => {
  setAddressData(data);
  setIsAddressValid(valid);
}, []);
```

Isso quebra o ciclo infinito e permite que o checkout funcione normalmente.

