
# Fase 1: Banco de Dados — Tabelas, RLS e Trigger

## Migracoes SQL

Uma unica migracao criando toda a estrutura:

### 1. Enum de status do pedido

```sql
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
```

### 2. Tabela `profiles`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK, FK auth.users) | Mesmo ID do auth |
| full_name | text | |
| avatar_url | text, nullable | |
| phone | text, nullable | |
| created_at | timestamptz, default now() | |
| updated_at | timestamptz, default now() | |

### 3. Tabela `addresses`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK auth.users, NOT NULL) | |
| label | text, default 'Casa' | |
| street | text | |
| number | text | |
| complement | text, nullable | |
| neighborhood | text | |
| city | text | |
| state | text | |
| zip_code | text | |
| is_default | boolean, default false | |
| created_at | timestamptz, default now() | |

### 4. Tabela `orders`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK auth.users, NOT NULL) | |
| product_id | text, NOT NULL | |
| customization_data | jsonb | Imagem, filtros, escala, rotacao |
| status | order_status, default 'pending' | |
| stripe_session_id | text, nullable | |
| stripe_subscription_id | text, nullable | |
| address_id | uuid (FK addresses), nullable | |
| total_cents | integer, NOT NULL | |
| created_at | timestamptz, default now() | |

### 5. Trigger: criar profile automaticamente

Funcao `handle_new_user()` (SECURITY DEFINER) que insere em `profiles` ao criar usuario no `auth.users`, extraindo `full_name` e `avatar_url` dos metadados.

### 6. Trigger: atualizar `updated_at` em profiles

Funcao `handle_updated_at()` que atualiza o campo `updated_at` automaticamente.

### 7. RLS — Politicas de acesso

Todas as tabelas com RLS habilitado. Cada tabela tera politicas para que usuarios autenticados so acessem seus proprios dados:

- **profiles**: SELECT, UPDATE onde `id = auth.uid()`
- **addresses**: SELECT, INSERT, UPDATE, DELETE onde `user_id = auth.uid()`
- **orders**: SELECT, INSERT onde `user_id = auth.uid()`

### 8. Realtime (opcional)

Habilitar realtime na tabela `orders` para atualizacoes de status em tempo real.

---

## Nenhum arquivo frontend sera modificado nesta fase

Esta fase e exclusivamente de banco de dados. A Fase 2 (autenticacao frontend) usara estas tabelas.
