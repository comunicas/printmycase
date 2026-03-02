

# Fase 2: Autenticacao — Login, Signup, Reset Password, AuthGuard e UserMenu

## Problemas a Corrigir Primeiro

Os triggers da Fase 1 (`handle_new_user` e `handle_updated_at`) existem como funcoes mas **nao foram conectados como triggers**. A migracao precisa corrigi-los.

## Migracao SQL

Criar os triggers que ficaram faltando:

```sql
-- Trigger: criar profile ao cadastrar usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualizar updated_at em profiles
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Componentes UI Necessarios

Criar componentes base que foram deletados na refatoracao e sao necessarios para formularios:

1. **`src/components/ui/input.tsx`** -- campo de texto padrao shadcn/ui
2. **`src/components/ui/label.tsx`** -- label padrao shadcn/ui

## Configurar Google OAuth

Usar a ferramenta **Configure Social Login** do Lovable Cloud para gerar o modulo `src/integrations/lovable/` com suporte a Google OAuth gerenciado.

## Arquivos a Criar

### 1. `src/hooks/useAuth.ts`
Hook central de autenticacao:
- Escuta `onAuthStateChange` do Supabase
- Expoe `user`, `profile`, `loading`, `signOut`
- Busca dados do perfil na tabela `profiles`

### 2. `src/components/AuthGuard.tsx`
Wrapper que:
- Verifica se ha usuario autenticado via `useAuth`
- Mostra loading spinner enquanto verifica
- Redireciona para `/login` se nao autenticado

### 3. `src/components/UserMenu.tsx`
Dropdown no header:
- Se logado: mostra nome/avatar + opcoes (Minha Conta, Sair)
- Se nao logado: botao "Entrar"

### 4. `src/pages/Login.tsx`
- Formulario email + senha
- Botao "Entrar com Google" (usando `lovable.auth.signInWithOAuth`)
- Link para `/signup` e `/reset-password`
- Redireciona para pagina anterior apos login

### 5. `src/pages/Signup.tsx`
- Formulario nome + email + senha
- Botao "Criar com Google"
- Link para `/login`
- Mensagem de verificacao de email apos cadastro

### 6. `src/pages/ResetPassword.tsx`
- Dois modos:
  - **Solicitar reset**: campo de email, envia link via `resetPasswordForEmail`
  - **Definir nova senha**: detecta `type=recovery` na URL, mostra campo de nova senha, chama `updateUser`

## Arquivos a Modificar

### 7. `src/App.tsx`
- Adicionar rotas: `/login`, `/signup`, `/reset-password`
- Envolver `/customize/:id` com `AuthGuard`

### 8. `src/components/AppHeader.tsx`
- Substituir botao "Ver Modelos" pelo `UserMenu` (manter "Ver Modelos" tambem)
- Importar e usar `useAuth` para estado de login

## Fluxo de Autenticacao

```text
Usuario clica "Customizar"
  |
  v
AuthGuard verifica sessao
  |
  +-- Logado --> abre /customize/:id
  |
  +-- Nao logado --> redireciona para /login?redirect=/customize/:id
        |
        +-- Login com email/senha --> volta para /customize/:id
        +-- Login com Google --> volta para /customize/:id
        +-- Nao tem conta --> /signup --> verificar email --> /login
```

## Detalhes Tecnicos

- **Google OAuth**: Usar `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` -- gerenciado automaticamente pelo Lovable Cloud
- **Email/senha**: Usar `supabase.auth.signUp` e `supabase.auth.signInWithPassword`
- **Confirmacao de email**: Mantida ativa (padrao do Supabase) -- usuarios precisam verificar email antes de logar
- **Reset senha**: `redirectTo` aponta para `window.location.origin + '/reset-password'`
- **Pacote necessario**: `@radix-ui/react-label` para o componente Label

## Ordem de Implementacao

```text
1. Migracao SQL (triggers)
2. Configurar Google OAuth (ferramenta Configure Social Login)
3. Criar input.tsx e label.tsx
4. Criar useAuth hook
5. Criar paginas Login, Signup, ResetPassword
6. Criar AuthGuard e UserMenu
7. Atualizar AppHeader com UserMenu
8. Atualizar App.tsx com novas rotas
```
