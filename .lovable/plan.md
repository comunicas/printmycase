
Objetivo: aprimorar apenas o bloco de informações do produto já existente no topo da sidebar da página `/customize/:slug`, usando a copy e os atributos da referência, sem mudar sua posição no layout.

## O que será alterado

### 1) Manter o bloco no local atual
O card continuará exatamente na área já destacada por você:
- topo da sidebar direita no desktop
- acima do título “Personalize sua Case”

Não haverá mudança estrutural de posição, apenas refinamento do conteúdo e da hierarquia visual.

### 2) Evoluir o resumo do produto com a copy da referência
Hoje o bloco mostra apenas:
- imagem do aparelho
- nome do produto
- preço

Ele será enriquecido para incluir, logo abaixo do preço, uma lista curta de atributos com copy inspirada na imagem enviada:

- `Policarbonato + TPU — proteção contra impactos e encaixe seguro`
- `Impressão UV LED — cores vivas, alta nitidez e ótima durabilidade`
- `Acabamento premium — fosco ou brilho, resistente e refinado`

A ideia é transformar o bloco em um resumo de valor do produto, sem ficar pesado.

### 3) Refinar a apresentação visual do bloco
O card passará a ter leitura mais premium e escaneável:

- thumbnail do produto mantida
- nome e preço com hierarquia mais forte
- bullets curtos com ícones sutis
- melhor espaçamento entre imagem, texto e benefícios
- visual compacto para não empurrar demais os controles da customização

Direção esperada:
```text
[imagem]  iPhone 16
         R$ 119,90

         • Policarbonato + TPU — proteção contra impactos e encaixe seguro
         • Impressão UV LED — cores vivas, alta nitidez e ótima durabilidade
         • Acabamento premium — fosco ou brilho, resistente e refinado
```

## Arquivo impactado

### `src/pages/Customize.tsx`
O bloco de resumo do produto dentro do `aside` será refatorado para:
- manter imagem, nome e preço
- adicionar os atributos/copys logo abaixo
- ajustar espaçamento e estilos do card

## Abordagem de implementação
1. Reaproveitar o bloco já existente no topo da sidebar.
2. Substituir o layout simples atual por uma versão mais rica e compacta.
3. Inserir três bullets de benefícios com ícones leves e consistentes com a UI.
4. Garantir que o bloco continue harmonioso com o restante da sidebar e não roube foco do CTA principal de upload no preview.

## Regras que serão respeitadas
- não mover o bloco de lugar
- não alterar o fluxo de customização
- não reintroduzir modal nem galeria
- não poluir visualmente a sidebar
- manter foco no primeiro passo da jornada: enviar imagem

## Check final documentado

### Conteúdo
- o bloco continua no topo da sidebar direita
- nome e preço permanecem visíveis
- os atributos da referência aparecem abaixo do preço
- a copy está refinada e clara

### Visual
- o resumo ficou mais premium e informativo
- os bullets têm boa legibilidade
- o bloco continua compacto
- não cria excesso de altura ou desbalanceamento na sidebar

### Regressão
- CTA de upload no frame continua intacto
- controles de ajustes/filtros continuam na mesma ordem
- botão “Finalizar” e restante da jornada não são afetados

## Resultado esperado
Depois da implementação, o local já destacado por você passa a comunicar melhor o valor da capinha com materiais, impressão e acabamento, usando uma copy mais comercial e informativa, sem mudar a estrutura da página.
