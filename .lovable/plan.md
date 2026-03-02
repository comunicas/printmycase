
# Pagina de Perfil do Usuario

Criar uma pagina `/profile` onde o usuario autenticado pode editar nome, telefone e avatar.

## O que sera feito

1. **Criar pagina `src/pages/Profile.tsx`** com formulario para editar:
   - Nome completo (campo texto)
   - Telefone (campo texto)
   - Avatar (upload de imagem com preview)

2. **Criar bucket de storage `avatars`** (publico) para armazenar as fotos de perfil, com politicas RLS para upload restrito ao proprio usuario.

3. **Adicionar rota `/profile`** em `App.tsx` protegida por `AuthGuard`.

4. **Adicionar link "Meu Perfil"** no `UserMenu.tsx` para navegacao.

5. **Adicionar `refetchProfile`** ao hook `useAuth.ts` para que a pagina de perfil possa atualizar os dados apos salvar.

## Detalhes tecnicos

### Storage (SQL migration)
- Criar bucket `avatars` publico
- Policy INSERT: usuario autenticado pode fazer upload em `{user_id}/*`
- Policy UPDATE: usuario pode sobrescrever seus proprios arquivos
- Policy DELETE: usuario pode deletar seus proprios arquivos

### Profile.tsx
- Usa `useAuth()` para carregar dados atuais
- Upload de avatar via `supabase.storage.from('avatars').upload()`
- URL publica via `getPublicUrl()`
- Update de perfil via `supabase.from('profiles').update()`
- Feedback com toast de sucesso/erro
- Layout consistente com as outras paginas (AppHeader + breadcrumbs)

### useAuth.ts
- Expor funcao `refetchProfile()` que re-busca o perfil do banco

### Arquivos modificados
| Arquivo | Alteracao |
|---|---|
| `src/pages/Profile.tsx` | Novo - pagina de perfil |
| `src/App.tsx` | Adicionar rota `/profile` com AuthGuard |
| `src/components/UserMenu.tsx` | Adicionar link "Meu Perfil" |
| `src/hooks/useAuth.ts` | Expor `refetchProfile` |
| Migration SQL | Criar bucket avatars + policies |
