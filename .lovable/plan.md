

## Conceder privilégios admin para rafael@comunicas.com.br

O usuário foi encontrado no banco:
- **Email**: rafael@comunicas.com.br
- **ID**: `ea5c41e2-c588-4ca5-8c8d-bd24ed014bf2`
- **Roles atuais**: nenhuma

### Ação

Inserir um registro na tabela `user_roles` com role `admin` para este usuário usando uma migration SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('ea5c41e2-c588-4ca5-8c8d-bd24ed014bf2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Após isso, o usuário terá acesso ao painel `/admin` e a todas as operações protegidas por `has_role(uid, 'admin')`.

Nenhuma alteração de código necessária.

