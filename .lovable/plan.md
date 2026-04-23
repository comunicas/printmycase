
Objetivo: ajustar a overlay mobile das tabs da customização para ocupar apenas o espaço necessário, melhorar a área útil para visualizar os controles sem cortar conteúdo, remover o botão de compra enquanto a overlay estiver aberta, e reduzir a altura vertical da modal sem alterar a navegação nem criar novos tabs/modelos.

## O que será alterado

### 1) Reduzir a altura da modal das tabs no mobile
Arquivo principal:
- `src/components/customize/MobileTabOverlay.tsx`

Implementação:
- substituir a altura fixa atual (`h-[60vh]`) por uma altura menor e mais controlada
- reduzir também o espaço vertical interno do header e do conteúdo
- manter a abertura como bottom sheet mobile, sem fullscreen e sem mexer no padrão desktop

Resultado esperado:
- a modal fica mais baixa
- sobra mais área visível do preview atrás dela
- o conteúdo continua acessível com scroll quando necessário

### 2) Fazer a modal ocupar só o necessário para o conteúdo visível
Hoje a sheet usa uma estrutura alta e genérica para todas as tabs. O ajuste será focado em densidade e leitura.

Implementação:
- diminuir paddings verticais do container
- reduzir a altura reservada ao cabeçalho
- recalcular a área interna de scroll para aproveitar melhor a altura disponível
- revisar especialmente as tabs `ajustes` e `filtros`, onde o usuário precisa enxergar melhor o controle ativo/executado

Resultado esperado:
- mais conteúdo útil aparece sem “esconder” os controles importantes
- menos sensação de modal grande demais para o que entrega
- melhor leitura do estado atual da edição

### 3) Corrigir a visualização do controle executado
O problema descrito indica que a área visível da modal não está mostrando bem o controle/resultado em uso.

Implementação:
- revisar o espaçamento e a altura útil da região scrollável da overlay
- evitar que header + margens consumam espaço demais
- manter os componentes internos (`AdjustmentsPanel` e `AiFiltersList`) intactos sempre que possível, priorizando correção no contêiner da modal
- se necessário, aplicar ajuste leve de padding/gap apenas no bloco mobile para caber melhor sem alterar o layout desktop

Resultado esperado:
- o controle ativo fica visível com menos rolagem
- filtros e ajustes aparecem de forma mais compacta e funcional no viewport 390x844
- melhora direta na usabilidade do fluxo mobile atual

### 4) Remover o botão “Comprar agora” do contexto da modal mobile
Arquivos impactados:
- `src/pages/Customize.tsx`
- possivelmente `src/components/customize/ContinueBar.tsx` apenas se for necessário controlar exibição via prop

Implementação:
- esconder o `ContinueBar` mobile quando alguma tab estiver aberta (`mobileTab !== null`)
- manter o botão fora da modal, em vez de competir visualmente com ela
- preservar o CTA normalmente quando nenhuma tab estiver aberta

Resultado esperado:
- a overlay fica focada só em ajustes/filtros/detalhes
- some o ruído do botão de compra durante a edição
- o usuário não perde área útil para o conteúdo da modal

## Arquivos impactados

### `src/components/customize/MobileTabOverlay.tsx`
Será ajustado para:
- reduzir a altura total da bottom sheet
- compactar header e paddings verticais
- otimizar a área scrollável para exibir melhor os controles

### `src/pages/Customize.tsx`
Será ajustado para:
- ocultar temporariamente o `ContinueBar` mobile enquanto a modal de tab estiver aberta

### `src/components/customize/ContinueBar.tsx`
Só será tocado se precisar de uma prop simples para controle de visibilidade; caso contrário, a ocultação ficará concentrada em `Customize.tsx`.

## Abordagem de implementação
1. Reduzir a altura fixa da `MobileTabOverlay`.
2. Compactar header, paddings e área interna scrollável.
3. Validar especialmente as tabs `ajustes` e `filtros` no viewport mobile atual.
4. Ocultar o `ContinueBar` enquanto a overlay estiver aberta.
5. Garantir que, ao fechar a modal, o CTA volte ao estado normal no rodapé.

## Check final documentado

### Modal mobile
- menor altura vertical
- ocupa apenas o necessário
- mostra melhor os controles sem cortar o conteúdo principal
- continua com scroll quando necessário

### CTA
- botão `Comprar agora` não aparece enquanto a tab modal estiver aberta
- volta normalmente ao fechar a overlay
- sem mudança no comportamento desktop

## Resultado esperado
Depois do ajuste, a modal mobile das tabs ficará mais compacta e funcional, com altura menor e melhor aproveitamento da área visível para ajustes e filtros. Ao mesmo tempo, o botão de compra deixará de competir com a overlay durante a edição, melhorando a leitura e a usabilidade do fluxo mobile.
