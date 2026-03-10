

## Redirecionar usuário logado para fora da página de Login/Signup

### Problema
O usuário já está logado (avatar visível no header) mas continua vendo a página de login. As páginas `/login` e `/signup` não verificam se já existe uma sessão ativa.

### Solução
Adicionar um `useEffect` em `Login.tsx` e `Signup.tsx` que verifica se o usuário já está autenticado via `useAuth()`. Se estiver, redireciona imediatamente para o `redirect` param (ou `/`).

### Alterações

**1. `src/pages/Login.tsx`**
- Importar `useAuth`
- Adicionar `useEffect` que chama `navigate(redirect)` quando `user` existe e `loading` é false

**2. `src/pages/Signup.tsx`**
- Mesmo padrão: importar `useAuth`, redirecionar para `/` se já logado

### Arquivos alterados
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`

