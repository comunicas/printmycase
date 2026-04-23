
Objetivo: permitir promover um usuário para administrador de forma segura dentro do painel Admin.

1. Adicionar gestão de privilégio no modal de usuário
- Incluir no `UserDetailDialog` um indicador de função atual do usuário.
- Adicionar uma ação explícita para “Tornar admin” e, se fizer sentido, também “Remover admin”.
- Posicionar essa ação no cabeçalho/resumo do usuário, alinhada ao layout já existente do modal.

2. Buscar e exibir a role atual corretamente
- Expandir o carregamento do `UsersManager` para também consultar a role do usuário em `user_roles`.
- Incluir esse dado no tipo `MergedUser` para que o modal já receba a informação necessária.
- Exibir status visual claro, por exemplo: “Administrador” vs “Usuário”.

3. Criar operação segura no backend para alterar privilégios
- Implementar uma função de backend exclusiva para admins, responsável por inserir/remover a role `admin` em `public.user_roles`.
- Validar o JWT e confirmar no backend que o solicitante já é admin antes de alterar qualquer role.
- Evitar qualquer verificação só no frontend; o frontend apenas dispara a ação.

4. Atualizar o frontend para usar a nova operação
- No `UserDetailDialog`, conectar os botões à nova função.
- Mostrar loading, sucesso e erro com toasts consistentes com o restante do painel.
- Atualizar os dados locais após a alteração para refletir imediatamente o novo privilégio sem exigir recarregar a página.

5. Preservar as regras atuais de segurança
- Manter `AdminGuard`, `useAdmin` e a rota `/admin` como estão, já que hoje o acesso depende da presença da role `admin` em `user_roles`.
- Garantir que a nova operação use a mesma fonte de verdade já adotada pelo projeto: `public.user_roles` + `public.has_role(...)`.

6. Verificação final
- Confirmar o fluxo:
  - admin abre `/admin`
  - entra em “Usuários”
  - abre o detalhe do usuário
  - promove para admin
  - o usuário promovido passa a satisfazer `useAdmin()` e consegue acessar `/admin`
- Validar também o caso negativo: um usuário comum não consegue executar essa alteração.

Detalhes técnicos
- Arquivos principais a ajustar:
  - `src/components/admin/UserDetailDialog.tsx`
  - `src/components/admin/UsersManager.tsx`
  - nova função em `supabase/functions/...`
- Fonte de verdade de permissão já existente:
  - `src/hooks/useAdmin.ts`
  - `src/components/AdminGuard.tsx`
  - `supabase/migrations/20260302155803_1ba4a0b8-3cae-4787-9a8a-4744726129f2.sql`
- Abordagem de segurança:
  - leitura e escrita de role controladas no backend
  - validação do solicitante como admin antes de promover outro usuário
  - nenhuma confiança em estado local ou UI para autorização
