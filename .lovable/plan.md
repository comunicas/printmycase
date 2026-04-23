
Objetivo: revisar a experiência mobile de `/customize/:slug` para que o CTA principal de upload e a copy do produto também funcionem bem no celular, com hierarquia clara, layout limpo e sem competir com o fluxo principal de personalização.

## O que será construído

### 1) Levar a copy do produto para o mobile no ponto certo da jornada
Hoje os highlights do produto existem só no `aside` desktop em `src/pages/Customize.tsx`. No mobile, essa camada de contexto praticamente some.

Será adicionada uma versão mobile do resumo do produto, reaproveitando a mesma copy já validada:
- `Policarbonato + TPU — proteção contra impactos e encaixe seguro`
- `Impressão UV LED — cores vivas, alta nitidez e ótima durabilidade`
- `Acabamento premium — fosco ou brilho, resistente`

Direção:
- posicionar esse bloco no mobile logo abaixo do preview, acima das barras fixas inferiores
- manter leitura compacta e discreta
- preservar a mesma copy 1:1 já aprovada
- evitar duplicação visual exagerada quando a imagem já estiver carregada

### 2) Revisar o CTA dentro do frame no mobile
O CTA atual em `src/components/PhonePreview.tsx` já existe, mas foi pensado com uma base compartilhada entre desktop e mobile.

A implementação será refinada para o mobile com foco em:
- melhor proporção dentro do frame menor
- menos peso visual excessivo
- leitura mais imediata no viewport 390x844
- toque confortável sem parecer um card grande demais

Ajustes previstos:
- reduzir levemente padding, tamanhos de ícone e tipografia no estado mobile
- manter o CTA centralizado no frame vazio
- garantir que o botão continue claramente clicável
- preservar a hierarquia: título forte + linha de apoio curta
- validar que o CTA continua harmonioso com safe zone, borda do aparelho e overlay de processamento

### 3) Separar melhor responsabilidades desktop/mobile
Hoje o desktop tem:
- resumo do produto na sidebar
- controles completos no `aside`

E o mobile tem:
- preview
- barra de abas
- barra de finalizar

A revisão vai organizar isso melhor:
- desktop continua com o bloco atual no topo da sidebar
- mobile ganha seu próprio bloco enxuto de informações do produto
- evitar que o usuário mobile dependa só do header/model selector para entender o valor do produto

### 4) Reaproveitar a estrutura de highlights sem inconsistência
Para não manter duas versões divergentes da mesma copy:
- extrair a estrutura de dados dos highlights para reaproveitamento interno
- usar o mesmo conteúdo em desktop e mobile
- permitir apenas pequenas diferenças visuais de spacing/tamanho entre breakpoints

Isso reduz risco de:
- copy divergente entre desktop e mobile
- futuras alterações feitas em apenas um lugar
- quebra de fidelidade com a referência já aprovada

### 5) Refinar a hierarquia visual mobile sem competir com o CTA principal
A regra será:
- CTA no frame continua sendo o principal convite à ação
- bloco de produto no mobile atua como apoio informativo
- `ContinueBar` continua simples, sem reintroduzir nome/preço no botão
- barras fixas inferiores não devem sufocar o conteúdo acima

Direção visual para o mobile:
```text
[Header]
[Preview com CTA quando vazio]
[Resumo do produto / highlights discretos]
[Histórico de filtros]
[Tab bar]
[Continue bar]
```

## Arquivos impactados

### `src/pages/Customize.tsx`
Será ajustado para:
- reaproveitar os highlights também no mobile
- inserir um bloco de resumo mobile em posição estratégica abaixo do preview
- manter o resumo desktop no local atual

### `src/components/PhonePreview.tsx`
Será refinado para:
- ajustar sizing e spacing do CTA no frame para mobile
- calibrar melhor a presença visual do botão vazio sem perder destaque
- manter upload, processing overlay, preview de filtro e badge de resolução intactos

## Abordagem de implementação
1. Reaproveitar a mesma copy dos highlights já aprovada.
2. Criar uma apresentação mobile compacta do resumo do produto.
3. Ajustar o CTA do frame com classes responsivas mais refinadas para mobile.
4. Preservar o comportamento atual de upload, drag, pinch, overlay e processing state.
5. Validar que desktop não regrediu visualmente.

## Regras que serão respeitadas
- não mudar o fluxo funcional de upload
- não mover o resumo desktop de lugar
- não poluir o mobile com um card pesado
- não adicionar preço/nome ao botão “Finalizar”
- manter o CTA do frame como principal ponto de entrada da jornada
- manter a copy dos highlights fiel à referência já aprovada

## Check final documentado

### Mobile
- o CTA dentro do frame fica melhor dimensionado e mais natural no celular
- o resumo do produto aparece também no mobile
- os highlights continuam discretos e legíveis
- o conteúdo não conflita com as barras fixas inferiores

### Desktop
- o bloco atual continua no topo da sidebar
- a copy permanece igual à versão aprovada
- não há regressão no layout existente

### Regressão funcional
- upload continua funcionando pelo frame e pelo botão secundário
- overlay de processamento continua cobrindo corretamente o preview
- safe zone, arraste, zoom e rotação continuam intactos
- dialogs e fluxo de customização não mudam

## Resultado esperado
Depois da implementação, o mobile passa a comunicar melhor o produto e o próximo passo da jornada: o CTA dentro do frame fica mais bem resolvido para tela pequena e a copy do produto também aparece no celular de forma compacta, clean e informativa, sem competir com a ação principal de enviar imagem.
