
Objetivo: reorganizar as abas mobile de `/customize/:slug` para que `Filtros IA` apareça na primeira posição e a aba de informações do produto passe para a terceira posição, com um rótulo mais alinhado ao conteúdo, como `Detalhes` ou `Produto`.

## O que será alterado

### 1) Reordenar as abas mobile
A barra inferior mobile em `src/components/customize/MobileTabBar.tsx` será reorganizada para esta ordem:

```text
[Filtros IA] [Ajustes] [Detalhes]
```

Se `Filtros IA` não estiver disponível para aquele produto, a ordem visível passa a ser:

```text
[Ajustes] [Detalhes]
```

### 2) Renomear a aba de informações
A aba hoje identificada visualmente como `Info`/`Informações` será trocada para um nome mais orientado ao conteúdo do produto.

Direção recomendada:
- rótulo da tab: `Detalhes`
- título do bottom sheet: `Detalhes do produto`

Alternativa equivalente, se quiser manter mais comercial:
- rótulo da tab: `Produto`
- título do bottom sheet: `Detalhes do produto`

A implementação seguirá uma nomenclatura consistente entre:
- label da tab
- título do overlay
- intenção do conteúdo exibido

### 3) Preservar o conteúdo atual da aba de produto
A terceira aba continuará exibindo exatamente o que já foi organizado:
- imagem do produto
- nome
- preço
- highlights com a mesma copy do desktop

Nada muda no conteúdo em si; apenas:
- nome da aba
- posição na navegação
- título exibido no overlay

### 4) Manter a acessibilidade e a lógica de bloqueio atuais
A lógica atual em `MobileTabBar.tsx` será preservada:
- `Filtros IA` e `Ajustes` continuam respeitando o estado de bloqueio quando ainda não há imagem
- a aba de detalhes do produto continua acessível mesmo antes do upload
- a lógica de abrir/fechar a mesma aba ao tocar novamente permanece igual

## Arquivos impactados

### `src/components/customize/MobileTabBar.tsx`
Será ajustado para:
- reordenar o array `tabs`
- trocar o label da aba `info` para `Detalhes` ou `Produto`
- manter a regra atual de desabilitação por aba

### `src/components/customize/MobileTabOverlay.tsx`
Será ajustado para:
- atualizar `tabTitles` da aba `info`
- refletir o novo nome visual no header do bottom sheet
- manter intacto o conteúdo da aba

## Abordagem de implementação
1. Reordenar o array de tabs para `filtros`, `ajustes`, `info`.
2. Atualizar o label visível da aba `info`.
3. Atualizar o título correspondente no overlay.
4. Validar que a renderização condicional de `hasFilters` não quebra a ordem esperada.
5. Confirmar que o comportamento de tab ativa e fechamento continua igual.

## Check final documentado

### Navegação mobile
- `Filtros IA` aparece na primeira posição
- `Ajustes` fica no meio
- `Detalhes`/`Produto` fica na terceira posição

### Conteúdo
- aba final continua mostrando nome, preço, imagem e highlights
- copy dos highlights permanece igual ao desktop
- nenhuma regressão no conteúdo do bottom sheet

### Comportamento
- aba de detalhes continua acessível sem imagem
- filtros e ajustes continuam respeitando bloqueio quando necessário
- abrir/fechar tabs continua funcionando normalmente

## Resultado esperado
Depois da implementação, a navegação mobile ficará mais coerente com a prioridade de uso: `Filtros IA` virá primeiro, `Ajustes` depois, e a aba de informações do produto ficará por último com um nome mais claro e mais alinhado ao conteúdo exibido.
