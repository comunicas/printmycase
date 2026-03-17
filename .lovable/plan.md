

## Diagnóstico

O problema tem duas causas raiz:

1. **Signup com verificação de email**: O `emailRedirectTo` no LoginDialog aponta para `window.location.origin` (ou seja, `/`). Após confirmar o email, o usuário cai na landing page em vez de voltar para `/customize/:id`. O rascunho no sessionStorage pode até existir, mas o usuário não é direcionado de volta.

2. **Google OAuth**: O `redirect_uri` também aponta para `window.location.origin`, fazendo o mesmo — após autenticar com Google, o usuário cai em `/` e perde o contexto da customização.

3. **Login com senha**: Esse caso já funciona — o LoginDialog fecha, o estado permanece em memória no componente.

## Solução

| Arquivo | Mudança |
|---|---|
| `src/components/customize/LoginDialog.tsx` | Aceitar prop `redirectUrl?: string`. Usar como `emailRedirectTo` no signup e como `redirect_uri` no Google OAuth. Fallback para `window.location.origin`. |
| `src/pages/Customize.tsx` | Passar `window.location.href` como `redirectUrl` para o LoginDialog, garantindo que após verificação de email ou OAuth o usuário volte para `/customize/:id`. |
| `src/hooks/useCustomize.tsx` | No efeito de draft restore, remover a guarda `draftRestored.current` para o caso do sessionStorage (que é idempotente), permitindo restauração mesmo após mudança de estado de auth. Alternativamente, re-triggerar quando `user` muda. |

### Fluxo corrigido

**Signup com email:**
1. Usuário customiza → clica "Finalizar" → LoginDialog abre
2. Preenche signup → "Verifique seu email"
3. Confirma email → link redireciona para `/customize/:slug`
4. Página carrega → sessionStorage tem o rascunho → restaurado automaticamente

**Google OAuth:**
1. Usuário customiza → LoginDialog → clica "Google"
2. Redireciona para Google → retorna para `/customize/:slug`
3. sessionStorage tem o rascunho → restaurado automaticamente

**Login com senha:**
4. Já funciona — dialog fecha, estado em memória preservado.

