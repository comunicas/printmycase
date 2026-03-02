

# Correcao de forwardRef e requisicoes duplicadas no useAuth

## Problema 1: Requisicoes duplicadas ao perfil

O `useAuth` usa apenas `onAuthStateChange`, que dispara multiplos eventos (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED etc.), cada um gerando um novo valor de `user` (mesmo que seja o mesmo usuario). Como o `useEffect` de profile depende de `[user]` por referencia, cada evento dispara uma nova requisicao ao banco.

### Correcao

Refatorar `useAuth` seguindo o padrao recomendado:
1. Chamar `getSession()` primeiro para restaurar sessao do storage - define user e loading uma unica vez
2. Assinar `onAuthStateChange` apenas para mudancas subsequentes (sign in/out)
3. No effect de profile, comparar `user.id` em vez da referencia do objeto para evitar fetches duplicados

```text
useEffect(() => {
  getSession() -> setUser, setLoading(false)
  onAuthStateChange -> setUser (sem async, sem await)
  return cleanup
}, [])

useEffect(() => {
  // Usa user?.id como dependencia via ref comparison
  if (!user) { setProfile(null); return }
  fetch profile...
}, [user?.id])  // <-- chave: depender do ID, nao da referencia
```

## Problema 2: Warnings de forwardRef

Os componentes `AppHeader`, `PhonePreview` e `ControlPanel` nao precisam realmente de `ref` -- os warnings provavelmente vem de componentes pai que tentam passar ref. A correcao e envolver cada um com `React.forwardRef` para que aceitem ref sem warning.

### Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useAuth.ts` | Adicionar `getSession()` inicial, usar `user?.id` como dep do profile effect |
| `src/components/AppHeader.tsx` | Envolver com `forwardRef` |
| `src/components/PhonePreview.tsx` | Envolver com `forwardRef` |
| `src/components/ControlPanel.tsx` | Envolver com `forwardRef` |

### Detalhes tecnicos

**useAuth.ts** - Estrutura final:
- `getSession()` no mount para restaurar sessao
- `onAuthStateChange` sem async para mudancas futuras
- Profile fetch com `[user?.id]` como dependencia (evita re-fetch quando a referencia muda mas o ID e o mesmo)

**Componentes com forwardRef** - Padrao:
```text
const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>...</div>;
});
Component.displayName = "Component";
export default Component;
```

Cada componente tera o ref aplicado ao elemento raiz (header, div externa).
