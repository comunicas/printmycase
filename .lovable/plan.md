

## Tela de Explicação antes do Login (Filtros IA / Upscale)

### Problema Atual
Quando o usuário não logado clica em um filtro IA ou no Upscale, o `LoginDialog` abre diretamente. Embora tenha um banner "Ganhe 50 moedas grátis!", não há contexto sobre **por que** o login é necessário nem o que o usuário ganhará ao se cadastrar — ele pode achar que é um paywall e abandonar.

### Solução
Adicionar um **estado intermediário** ao `LoginDialog` — uma tela de "motivo" que aparece antes do formulário de login/signup. Essa tela explica o benefício e só depois mostra o formulário.

### Mudanças

**1. `src/components/customize/LoginDialog.tsx`**
- Adicionar uma nova prop opcional `reason?: "filter" | "upscale" | null` para indicar o contexto
- Adicionar um estado `showReason` que começa `true` quando `reason` é passado
- Renderizar uma **tela de explicação** antes do formulário:
  - Ícone contextual (varinha mágica para filtro, estrela para upscale)
  - Título: "Para usar Filtros IA" ou "Para usar o Upscale IA"
  - Texto: "Crie sua conta gratuita e receba **50 moedas grátis** para começar a usar agora mesmo!"
  - Bullet points: "✓ Filtros artísticos com IA", "✓ Upscale 4x de resolução", "✓ Sem compromisso"
  - Botão primário "Criar conta grátis" → avança para o formulário (tab signup)
  - Link "Já tenho conta" → avança para o formulário (tab login)
- Quando o usuário clica num dos botões, `showReason` vira `false` e o formulário existente aparece normalmente

**2. `src/hooks/useCustomize.tsx`**
- Adicionar estado `loginReason: "filter" | "upscale" | null`
- Em `requireAuth()`: setar o reason antes de abrir o dialog
- Nos handlers de upscale via toast: setar reason como `"upscale"`
- Exportar `loginReason` no return

**3. `src/pages/Customize.tsx`**
- Passar a nova prop `reason={c.loginReason}` ao `LoginDialog`

### Resultado
- 3 arquivos editados
- Usuário entende o valor antes de ver o formulário
- Conversão esperada maior por contexto + urgência ("50 moedas grátis agora")
- Zero impacto nos usuários já logados

