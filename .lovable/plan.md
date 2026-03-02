
# Padronizacao de formularios + Painel Admin com CRUD de produtos e Stripe

## 1. Componente de formulario padronizado

Criar um conjunto de componentes reutilizaveis para padronizar todos os formularios do projeto:

| Componente | Descricao |
|---|---|
| `src/components/ui/form-field.tsx` | Wrapper que combina Label + Input + mensagem de erro em um unico componente |
| `src/components/forms/FormCard.tsx` | Card padrao para secoes de formulario (titulo, descricao, conteudo) |
| `src/components/forms/SubmitButton.tsx` | Botao de submit com estado de loading integrado (spinner + texto) |

Padrao de uso:
```text
<FormCard title="Meu Perfil" description="Edite seus dados">
  <FormField label="Nome" id="name" required>
    <Input value={name} onChange={...} />
  </FormField>
  <SubmitButton loading={saving}>Salvar</SubmitButton>
</FormCard>
```

Paginas que serao refatoradas para usar os novos componentes:
- `Login.tsx` - campos de email/senha
- `Signup.tsx` - campos de nome/email/senha
- `ResetPassword.tsx` - campos de email e nova senha
- `Profile.tsx` - campos de perfil, senha e exclusao

## 2. Sistema de roles para admin

### Migracao SQL
- Criar enum `app_role` com valores `admin` e `user`
- Criar tabela `user_roles` (id, user_id, role) com FK para auth.users e ON DELETE CASCADE
- Habilitar RLS na tabela com policy SELECT para o proprio usuario
- Criar funcao `has_role(uuid, app_role)` como SECURITY DEFINER para checagem segura
- Criar tabela `products` no banco para substituir o arquivo estatico:

```text
products (
  id uuid PK default gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text,
  stripe_product_id text,
  images text[] default '{}',
  specs jsonb default '[]',
  colors jsonb default '[]',
  rating numeric default 0,
  review_count integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

- RLS: SELECT publico (todos podem ver produtos ativos), INSERT/UPDATE/DELETE restrito a admins via `has_role()`
- Trigger `handle_updated_at` na tabela products

### Edge function: `admin-sync-stripe`
Funcao para sincronizar produtos com o Stripe:
- **Criar produto**: cria produto + preco no Stripe, salva `stripe_product_id` e `stripe_price_id` no banco
- **Atualizar preco**: cria novo preco no Stripe (precos sao imutaveis), desativa o antigo, atualiza `stripe_price_id`
- **Desativar produto**: arquiva o produto no Stripe
- Validacao: apenas admins (verifica role via service role client)

### Hook `useAdmin`
```text
src/hooks/useAdmin.ts
- Consulta user_roles para verificar se o usuario logado tem role 'admin'
- Retorna { isAdmin, loading }
```

### Componente `AdminGuard`
```text
src/components/AdminGuard.tsx
- Similar ao AuthGuard, mas verifica isAdmin
- Redireciona para / se nao for admin
```

## 3. Pagina Admin

### Rota
- `/admin` protegida por `AuthGuard` + `AdminGuard`
- Link condicional no `UserMenu` (so aparece se `isAdmin`)

### Layout
- AppHeader com breadcrumb "Admin > Produtos"
- Tabela de produtos com colunas: Imagem, Nome, Slug, Preco, Status Stripe, Ativo, Acoes
- Botao "Novo Produto" no topo

### CRUD completo
- **Listar**: busca da tabela `products` com paginacao
- **Criar**: formulario em dialog/pagina com campos: nome, slug, descricao, preco (R$), imagens (URLs), specs, cores, ativo
  - Ao salvar, chama edge function `admin-sync-stripe` para criar no Stripe
- **Editar**: mesmo formulario preenchido, com logica de deteccao de mudanca de preco
  - Se preco mudou, chama `admin-sync-stripe` para criar novo preco e desativar o antigo
- **Excluir/Desativar**: soft delete (marca como `active = false`) e arquiva no Stripe

### Fluxo de sincronizacao Stripe
```text
1. Admin preenche formulario e salva
2. Frontend insere/atualiza na tabela products
3. Frontend chama edge function admin-sync-stripe com { action, product_id }
4. Edge function:
   - create: stripe.products.create() + stripe.prices.create()
   - update_price: stripe.prices.create() + stripe.prices.update(old, active:false)
   - archive: stripe.products.update(active:false)
5. Edge function atualiza stripe_product_id e stripe_price_id no banco
6. Frontend refaz fetch para atualizar UI
```

## Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| `src/components/ui/form-field.tsx` | Novo - campo de formulario padronizado |
| `src/components/forms/FormCard.tsx` | Novo - card wrapper para formularios |
| `src/components/forms/SubmitButton.tsx` | Novo - botao submit com loading |
| `src/pages/Login.tsx` | Refatorar para usar FormField |
| `src/pages/Signup.tsx` | Refatorar para usar FormField |
| `src/pages/ResetPassword.tsx` | Refatorar para usar FormField |
| `src/pages/Profile.tsx` | Refatorar para usar FormCard/FormField/SubmitButton |
| `src/hooks/useAdmin.ts` | Novo - hook para verificar role admin |
| `src/components/AdminGuard.tsx` | Novo - guard para rotas admin |
| `src/pages/Admin.tsx` | Novo - pagina admin com CRUD de produtos |
| `src/components/admin/ProductFormDialog.tsx` | Novo - dialog de criacao/edicao de produto |
| `src/components/admin/ProductsTable.tsx` | Novo - tabela de produtos |
| `supabase/functions/admin-sync-stripe/index.ts` | Novo - edge function para sync Stripe |
| `src/components/UserMenu.tsx` | Adicionar link Admin condicional |
| `src/App.tsx` | Adicionar rota /admin |
| Migration SQL | Criar tabela products, user_roles, enum, funcao has_role |

## Migracao de dados
- Os produtos atuais em `src/data/products.ts` serao inseridos na tabela `products` via migration SQL (INSERT)
- O arquivo `products.ts` sera mantido temporariamente como fallback mas as paginas de catalogo/produto passarao a buscar do banco
- A edge function `create-checkout` sera atualizada para buscar o preco do banco (stripe_price_id) em vez de usar preco hardcoded
