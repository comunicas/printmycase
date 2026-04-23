
Objetivo: mover a copy mobile do produto para dentro da navegação por abas da página `/customize/:slug`, criando uma nova aba de informações que concentre o resumo do produto e os highlights com a mesma copy do desktop, em vez de deixá-los soltos abaixo do preview.

## O que será alterado

### 1) Criar uma nova aba mobile de informações
A navegação mobile hoje tem:
- `Ajustes`
- `Filtros IA`

Ela passará a incluir uma terceira aba:
- `Info`

Essa nova aba será usada para exibir:
- imagem do produto
- nome do produto
- preço
- lista de highlights com a mesma copy do desktop

Direção:
```text
[Ajustes] [Info] [Filtros IA]
```

### 2) Levar a copy para junto das informações do produto
O bloco mobile que hoje fica abaixo do preview em `src/pages/Customize.tsx` será removido dessa posição.

Em vez disso, o conteúdo será consolidado dentro da nova aba `Info`, reunindo:
- thumbnail
- nome
- preço
- highlights reaproveitados via `ProductHighlightsList`

Isso resolve o ponto principal pedido por você:
- a copy fica junto com as informações do produto
- a experiência mobile fica mais organizada
- o preview continua mais limpo visualmente

### 3) Manter a copy exatamente igual ao desktop
A aba `Info` vai reutilizar a mesma fonte de dados já extraída para os highlights, preservando a copy 1:1:

- `Policarbonato + TPU — proteção contra impactos e encaixe seguro`
- `Impressão UV LED — cores vivas, alta nitidez e ótima durabilidade`
- `Acabamento premium — fosco ou brilho, resistente`

Sem duplicar textos manualmente em dois lugares.

### 4) Ajustar o overlay mobile para suportar a nova aba
O `MobileTabOverlay` hoje renderiza apenas:
- painel de ajustes
- lista de filtros

Ele será ampliado para também renderizar a aba `Info`, com um layout compacto e consistente com o restante da UI mobile:
- topo com thumbnail + nome + preço
- highlights abaixo
- visual clean, discreto e informativo
- sem competir com o CTA principal do frame

### 5) Preservar a hierarquia da jornada mobile
A organização final ficará assim:
```text
[Header]
[Preview com CTA principal]
[Histórico de filtros]
[Tab bar: Ajustes / Info / Filtros]
[Continue bar]
```

Quando o usuário tocar em `Info`, abre o bottom sheet com os detalhes do produto.
Assim:
- o CTA no frame continua sendo a ação principal
- a copy do produto continua acessível
- o conteúdo informativo não ocupa espaço fixo abaixo do preview

## Arquivos impactados

### `src/components/customize/MobileTabBar.tsx`
Será ajustado para:
- adicionar o tipo/aba `info`
- incluir ícone e rótulo da nova aba
- manter a lógica de tabs visíveis estável

### `src/components/customize/MobileTabOverlay.tsx`
Será ajustado para:
- suportar `activeTab === "info"`
- receber props do produto necessárias para renderizar resumo + highlights
- exibir a copy do produto no mesmo padrão do desktop

### `src/pages/Customize.tsx`
Será ajustado para:
- parar de renderizar o card mobile solto abaixo do preview
- passar nome, preço e imagem do produto para o `MobileTabOverlay`
- manter o resumo desktop no local atual, sem mudanças estruturais

## Abordagem de implementação
1. Estender o tipo `MobileTab` com a nova opção `info`.
2. Adicionar a aba `Info` na barra inferior mobile.
3. Passar dados do produto para o overlay mobile.
4. Renderizar dentro do overlay um bloco de informações reutilizando `ProductHighlightsList compact`.
5. Remover o card informativo fixo que hoje fica abaixo do preview no mobile.
6. Garantir que desktop continue intacto.

## Regras que serão respeitadas
- não mover o bloco desktop de lugar
- manter a copy dos highlights idêntica à já aprovada
- não alterar o fluxo funcional de upload/customização
- manter o CTA do frame como principal ponto de atenção
- não adicionar nome/preço no botão “Finalizar”

## Check final documentado

### Mobile
- existe nova aba `Info`
- a copy ficou junto das informações do produto
- o card solto abaixo do preview foi removido
- a aba mostra nome, preço, imagem e highlights com a mesma copy do desktop
- o layout continua limpo e compacto

### Desktop
- o resumo do produto permanece no topo da sidebar
- highlights continuam iguais
- nenhuma regressão visual ou estrutural

### Regressão funcional
- tabs mobile continuam abrindo/fechando normalmente
- ajustes e filtros continuam funcionando
- CTA do preview continua intacto
- barra de finalizar continua sem mudanças indevidas

## Resultado esperado
Depois da implementação, o mobile deixa de exibir a copy como um bloco separado sob o preview e passa a concentrar as informações do produto em uma nova aba `Info`, com a mesma copy do desktop, deixando a interface mais organizada, limpa e coerente com a navegação por abas.
