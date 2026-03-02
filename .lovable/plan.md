

# Atribuir role admin ao usuario Rafael Bruno

Sera executada uma insercao na tabela `user_roles` para atribuir a role `admin` ao usuario encontrado no banco.

## Dados do usuario
- **Nome:** Rafael Bruno
- **Email:** rafael@comunicas.com.br
- **ID:** `8ade2db7-4961-499a-88ad-dffc6518e313`

## O que sera feito

Executar um INSERT na tabela `user_roles` com os seguintes dados:

```text
user_id: 8ade2db7-4961-499a-88ad-dffc6518e313
role: admin
```

Apos a insercao, o hook `useAdmin` passara a retornar `isAdmin: true` para este usuario, liberando acesso ao painel `/admin` e exibindo o link "Admin" no menu do usuario.

