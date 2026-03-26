

## Melhorar UX de Login, Cadastro e Header para Usuarios Nao Logados

### Situacao atual

- **Login/Signup**: Paginas simples com fundo `bg-background`, logo grande, formulario centralizado. Sem card visual, sem incentivo de conversao, sem consistencia com o LoginDialog (que ja tem banner de moedas gratis e tabs).
- **Header (UserMenu)**: Para usuarios nao logados, exibe apenas um botao ghost "Entrar" — sem CTA de cadastro.
- **LoginDialog**: Ja tem um UX superior com banner de moedas, tabs login/signup, e layout mais compacto. As paginas full-page devem seguir esse mesmo padrao.

### O que sera feito

| # | Arquivo | Alteracao |
|---|---------|-----------|
| 1 | `UserMenu.tsx` | Adicionar botao "Cadastre-se gratis" (variant primary, size sm) ao lado do "Entrar" para usuarios nao logados |
| 2 | `Login.tsx` | Redesign: card com sombra, banner de incentivo (50 moedas gratis) no topo como no LoginDialog, remover logo duplicada (ja esta no header), visual mais limpo |
| 3 | `Signup.tsx` | Mesmo redesign: card com banner de incentivo, layout consistente com Login, manter checkbox de termos |

### Detalhes do redesign Login/Signup

**Estrutura visual (ambas as paginas):**
- Envolver formulario em um `Card` com `max-w-md` centralizado
- Banner gradiente amber-to-orange no topo do card (igual ao LoginDialog) com icone de moedas e texto "Ganhe 50 moedas gratis!"
- Remover logo grande redundante (AppHeader ja mostra)
- Titulo e subtitulo mais compactos
- Botao Google com mesmo estilo
- Divisor "ou" mantido
- Link para a outra pagina (Entrar / Criar conta) no rodape do card

**Header para nao logados:**
- "Entrar" permanece como `variant="ghost"`
- Novo botao "Cadastre-se" com `variant="default"` (primary roxo) ao lado, com link para `/signup`
- No mobile, ambos ficam `size="sm"` para caber
- Respeita prop `transparent` para modo hero

### Arquivos modificados
- `src/components/UserMenu.tsx` — adicionar CTA "Cadastre-se"
- `src/pages/Login.tsx` — redesign com card e banner
- `src/pages/Signup.tsx` — redesign com card e banner

