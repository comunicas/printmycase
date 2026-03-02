

# Mascara de telefone, alterar senha e excluir conta

## 1. Mascara de telefone

Adicionar formatacao automatica no campo de telefone no formato `(XX) XXXXX-XXXX`. Sera implementada uma funcao utilitaria pura (sem dependencia externa) que formata o valor conforme o usuario digita, removendo caracteres nao-numericos e aplicando a mascara.

## 2. Secao "Alterar senha"

Adicionar um card separado abaixo do formulario de perfil com dois campos: "Nova senha" e "Confirmar nova senha". Ao submeter, usa `supabase.auth.updateUser({ password })` para atualizar. Validacoes: minimo 6 caracteres, senhas devem coincidir.

## 3. Secao "Excluir conta"

Adicionar um card com botao destrutivo "Excluir minha conta". Ao clicar, exibe um dialog de confirmacao pedindo que o usuario digite "EXCLUIR" para confirmar. A exclusao sera feita via uma edge function `delete-account` que:
- Valida o JWT do usuario
- Remove o avatar do storage
- Deleta o usuario via `supabase.auth.admin.deleteUser()`
- Os dados em `profiles`, `orders`, `addresses` serao removidos em cascata (FK com ON DELETE CASCADE ja existe para profiles; para orders/addresses, sera verificado)

## Arquivos

| Arquivo | Acao |
|---|---|
| `src/pages/Profile.tsx` | Adicionar mascara de telefone, secao de alterar senha, secao de excluir conta com dialog de confirmacao |
| `src/lib/masks.ts` | Novo - funcao `maskPhone(value: string): string` |
| `supabase/functions/delete-account/index.ts` | Novo - edge function para deletar usuario |
| `supabase/config.toml` | Adicionar config `[functions.delete-account]` com `verify_jwt = false` |

## Detalhes tecnicos

### Mascara de telefone (`src/lib/masks.ts`)
```text
maskPhone("11999998888") -> "(11) 99999-8888"
- Remove tudo que nao e digito
- Limita a 11 digitos
- Aplica formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX (8 digitos)
```

### Edge function `delete-account`
- Extrai JWT do header Authorization
- Valida com `supabase.auth.getUser(token)`
- Usa service role client para `auth.admin.deleteUser(userId)`
- Retorna 200 em sucesso ou erro apropriado
- CORS headers inclusos

### Fluxo de exclusao no frontend
1. Usuario clica "Excluir minha conta"
2. Dialog aparece pedindo digitar "EXCLUIR"
3. Ao confirmar, chama `supabase.functions.invoke('delete-account')`
4. Em sucesso, faz signOut e redireciona para `/`

### Alteracao de senha
- Formulario independente do formulario de perfil (submit separado)
- Usa `supabase.auth.updateUser({ password: newPassword })`
- Limpa campos apos sucesso

