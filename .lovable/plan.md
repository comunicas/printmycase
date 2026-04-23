
Objetivo: ajustar o bloco de highlights da sidebar em `/customize/:slug` para ficar o mais fiel possível à referência enviada, com copy 1:1 em termos e pontuação, e ao mesmo tempo reduzir o peso visual do bloco para deixá-lo mais clean, discreto e com menos atenção que o CTA principal de upload.

## Diagnóstico atual
Hoje o bloco em `src/pages/Customize.tsx` já está muito próximo da referência na copy:
- `Policarbonato + TPU — proteção contra impactos e encaixe seguro`
- `Impressão UV LED — cores vivas, alta nitidez e ótima durabilidade`
- `Acabamento premium — fosco ou brilho, resistente`

Mas ainda há diferenças visuais em relação à referência:
- ícones estão maiores e com mais destaque
- tipografia está um pouco mais forte
- espaçamento pode estar mais “UI” do que “editorial”
- a quebra de linha depende do container atual, então precisa ser preservada com mais cuidado para continuar visualmente fiel

## O que será ajustado

### 1) Confirmar a copy 1:1 com a referência
No array `productHighlights` em `src/pages/Customize.tsx`, manter exatamente estes textos:

- `Policarbonato + TPU` + `proteção contra impactos e encaixe seguro`
- `Impressão UV LED` + `cores vivas, alta nitidez e ótima durabilidade`
- `Acabamento premium` + `fosco ou brilho, resistente`

Com garantia de:
- mesmo termo
- mesma pontuação
- uso do travessão `—`
- nenhuma palavra extra
- nenhuma remoção indevida

### 2) Refinar o bloco para ficar mais discreto
Reduzir o peso visual do bloco sem mudar sua posição:
- diminuir tamanho dos ícones
- diminuir o círculo/fundo dos ícones
- suavizar contraste do fundo dos ícones
- reduzir levemente o tamanho da fonte dos highlights
- deixar o título do highlight menos “pesado” visualmente
- apertar espaçamentos verticais para um bloco mais compacto

Direção visual:
```text
mais editorial / informativo
menos card chamativo / menos destaque visual
```

### 3) Preservar a hierarquia correta da página
O bloco de atributos deve continuar secundário em relação a:
- CTA de upload dentro do frame
- preview do produto
- fluxo principal de customização

Para isso, o ajuste vai:
- manter preço e nome legíveis
- deixar os bullets mais sutis
- evitar cores muito vibrantes ou áreas sólidas muito chamativas
- manter boa leitura sem competir com o CTA do frame

### 4) Cuidar da fidelidade das quebras de linha
Como a referência mostra quebras específicas por largura:
- o bloco será ajustado para favorecer uma largura de texto próxima da referência
- o espaçamento entre ícone e texto será refinado para não empurrar quebras desnecessárias
- a implementação vai buscar reproduzir o comportamento visual da referência no desktop atual do projeto

Importante:
- a quebra exata pode variar minimamente conforme fonte/renderização do navegador
- a meta é atingir equivalência visual prática no viewport desktop atual do projeto

## Arquivo impactado

### `src/pages/Customize.tsx`
Mudanças previstas:
- manter a estrutura do bloco atual
- ajustar somente copy final, classes de tipografia, espaçamento e tamanho/estilo dos ícones
- sem mover o bloco de lugar
- sem alterar fluxo funcional da página

## Estratégia de implementação
1. Revisar o array `productHighlights` e garantir que o texto esteja exatamente igual à referência.
2. Reduzir a presença visual dos ícones e seus containers.
3. Diminuir discretamente a fonte e o peso tipográfico dos bullets.
4. Refinar gaps e alinhamentos para aproximar as quebras de linha da imagem enviada.
5. Validar que o bloco continua compacto e harmonioso com a sidebar de 420px.

## Check final documentado

### Fidelidade da copy
- textos dos 3 highlights estão 1:1 com a referência
- travessão e vírgulas conferem com a imagem
- nenhum termo extra foi mantido

### Visual
- ícones estão menores
- o bloco está mais clean e discreto
- tipografia está menos chamativa
- o resumo continua elegante e legível

### Layout
- bloco permanece no topo da sidebar
- quebras de linha ficam visualmente próximas da referência
- a altura do bloco não compromete os controles abaixo

### Hierarquia
- CTA de upload no frame continua sendo o principal ponto de atenção
- highlights funcionam como apoio informativo, não como elemento principal

## Resultado esperado
Depois da implementação, o bloco de highlights ficará mais fiel à referência tanto no texto quanto na sensação visual: mesma copy, mesma intenção de leitura, menos peso gráfico e aparência mais limpa, discreta e premium dentro da sidebar de customização.
