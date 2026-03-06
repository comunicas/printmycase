

## Plano: Custo simplificado + Confirmação antes de aplicar filtro IA

### Problema
- O custo "🪙 10" está repetido em cada botão de filtro, poluindo visualmente
- Não há confirmação antes de consumir moedas — o usuário pode clicar sem querer e perder 10 moedas

### Solução

**1. Simplificar exibição de custo**
- Remover o "🪙 10" de cada botão individual
- Adicionar uma linha informativa única acima da lista de filtros: `"Cada filtro consome 🪙 10 moedas"` com texto pequeno e discreto (`text-xs text-muted-foreground`)
- Botões ficam mais limpos, só com ícone/thumbnail + nome

**2. Dialog de confirmação ao clicar em filtro**
- Ao clicar num filtro (exceto para desativar), abrir um `AlertDialog` mostrando:
  - Nome do filtro selecionado
  - Custo: 🪙 10 moedas
  - Saldo atual do usuário (usar `useCoins` hook)
  - Saldo após aplicação
  - Botões "Cancelar" / "Aplicar filtro"
- Só após confirmar, chamar a edge function
- Se saldo insuficiente, mostrar no próprio dialog com link para comprar moedas

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/components/customize/AiFiltersList.tsx` | Remover "🪙 10" dos botões, adicionar texto informativo acima da lista |
| `src/components/customize/ImageControls.tsx` | Passar `coinBalance` como prop |
| `src/pages/Customize.tsx` | Importar `useCoins`, adicionar estado para dialog de confirmação, separar seleção do filtro da execução |
| Novo: `src/components/customize/FilterConfirmDialog.tsx` | Dialog de confirmação com detalhes do filtro, custo e saldo |

### Fluxo revisado
1. Usuário clica no filtro → abre dialog de confirmação
2. Dialog mostra: filtro, custo (10), saldo atual, saldo restante
3. Usuário confirma → executa `apply-ai-filter`
4. Usuário cancela → nada acontece

