

## Adicionar Mensagem "Moedas Não Debitadas" em Todos os Erros de Geração IA

### Problema
Quando filtro IA ou upscale IA falham, o toast de erro não informa que as moedas não foram cobradas, causando insegurança no usuário.

### Solução
Atualizar 4 pontos de erro em `src/hooks/useCustomize.tsx` para incluir a mensagem "Nenhuma moeda foi debitada. Tente gerar novamente."

### Alterações — arquivo único: `src/hooks/useCustomize.tsx`

**1. Filtro IA — erro na resposta (linha 354)**
- De: `description: errorMsg`
- Para: `description: "Nenhuma moeda foi debitada. Tente gerar novamente."`

**2. Filtro IA — catch genérico (linha 380)**
- De: `toast({ title: "Erro ao aplicar filtro", variant: "destructive" })`
- Para: `toast({ title: "Erro ao aplicar filtro", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" })`

**3. Upscale IA — erro na resposta (linha 411)**
- De: `description: errorMsg`
- Para: `description: "Nenhuma moeda foi debitada. Tente gerar novamente."`

**4. Upscale IA — catch genérico (linha 436)**
- De: `toast({ title: "Erro no upscale", variant: "destructive" })`
- Para: `toast({ title: "Erro no upscale", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" })`

**Nota:** Os casos de "Moedas insuficientes" mantêm a mensagem atual (não houve tentativa de geração, então não faz sentido dizer que não foi debitado).

### Resultado
- 1 arquivo modificado, 4 pontos de erro atualizados
- Ambos os fluxos de geração IA (filtro e upscale) cobertos
- Usuário fica tranquilo que não perdeu moedas ao ver qualquer erro

