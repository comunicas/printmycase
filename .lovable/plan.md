

# Fase 3: Melhorias de Arquitetura

## 1. AuthContext — Centralizar estado de autenticação

**Problema**: `useAuth()` é chamado independentemente em 9 arquivos, cada um criando sua própria instância com `getSession()` e `onAuthStateChange`. Isso gera múltiplas listeners e queries de perfil paralelas.

**Solução**:
- Criar `src/contexts/AuthContext.tsx` com `AuthProvider` + `useAuth` via Context
- O provider faz `getSession` + `onAuthStateChange` **uma única vez**
- Todos os consumidores (`AuthGuard`, `AdminGuard`, `UserMenu`, `Profile`, `Orders`, `Checkout`, `CheckoutSuccess`, `AddressForm`) recebem o estado compartilhado
- Manter a mesma interface: `{ user, profile, loading, signOut, refetchProfile }`
- Envolver `<App>` com `<AuthProvider>` em `App.tsx`
- Atualizar `src/hooks/useAuth.ts` para re-exportar o hook do context (manter compatibilidade de imports)

## 2. Lazy loading de rotas

**Problema**: Todas as 13 páginas são importadas sincronamente, aumentando o bundle inicial.

**Solução**:
- Converter imports em `App.tsx` para `React.lazy()` para páginas pesadas: `Admin`, `Customize`, `Checkout`, `Orders`, `Profile`, `Product`, `Catalog`
- Manter `Landing`, `Login`, `Signup`, `ResetPassword`, `NotFound` como imports estáticos (leves ou críticas para first paint)
- Envolver `<Routes>` com `<Suspense fallback={<LoadingSpinner variant="fullPage" />}>`

## 3. Otimizar SeoHead

**Problema**: `SeoHead` chama `useProducts(8)` internamente, duplicando a query que `Landing.tsx` já faz.

**Solução**:
- Adicionar prop opcional `products` ao `SeoHead`
- Se `products` for passado, usar diretamente; senão, manter fallback com `useProducts(8)`
- Em `Landing.tsx`, passar os produtos já carregados: `<SeoHead products={products} />`
- Remover `SearchAction` do JSON-LD (não há busca implementada)
- Atualizar TITLE/DESCRIPTION para remover referências hardcoded a "iPhone"

## Arquivos afetados

| Ação | Arquivo |
|------|---------|
| Criar | `src/contexts/AuthContext.tsx` |
| Editar | `src/hooks/useAuth.ts` — re-exportar do context |
| Editar | `src/App.tsx` — AuthProvider + lazy imports + Suspense |
| Editar | `src/components/SeoHead.tsx` — prop products, remover SearchAction, atualizar textos |
| Editar | `src/pages/Landing.tsx` — passar products ao SeoHead |

