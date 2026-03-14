

## Dialog de Login/Cadastro na Customização com incentivo de 50 coins grátis

### Ideia — Avaliação

A ideia é excelente para conversão. O usuário já está engajado (escolheu produto, fez upload da imagem, ajustou) e ao tentar usar filtros IA ou upscale, em vez de ser redirecionado para outra página (perdendo contexto), vê um dialog inline com incentivo claro: **"Ganhe 50 coins grátis ao criar sua conta"**. Isso reduz fricção e aumenta a taxa de cadastro.

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/components/customize/LoginDialog.tsx` | **Novo** — Dialog com duas abas (Login / Criar conta) usando a mesma estrutura visual das páginas existentes. Banner destacado: "🎁 Ganhe 50 ArtisCoins grátis ao criar sua conta!" com subtexto "Use para filtros IA, upscale e muito mais" |
| `src/hooks/useCustomize.tsx` | `requireAuth()` passa a setar `showLoginDialog = true` em vez de redirecionar para `/login`. Expor estado `showLoginDialog` / `setShowLoginDialog` |
| `src/pages/Customize.tsx` | Renderizar `<LoginDialog>` controlado pelo estado do hook |

### LoginDialog — Estrutura

- **Banner de incentivo** no topo: fundo gradiente amber/orange com ícone de moeda e texto "Crie sua conta e ganhe 50 coins grátis!"
- **Aba Login**: email/senha + Google OAuth + link "Esqueceu a senha?"
- **Aba Criar conta**: nome + email + senha + checkbox termos + Google OAuth
- Ao autenticar com sucesso, dialog fecha automaticamente (o `AuthContext` atualiza `user`, dialog reage a isso)
- Mesmos handlers de auth das páginas Login.tsx e Signup.tsx (reutiliza lógica, não componente — pois as páginas têm layout full-page)

### Fluxo do usuário
1. Upload de imagem → ajusta livremente (sem login)
2. Clica em filtro IA / upscale / continuar → Dialog abre
3. Vê "50 coins grátis" → cria conta ou faz login
4. Dialog fecha → usuário prossegue com a ação

