

# Refatoracao do PhonePreview - Correcao de Imagem e Drag

## Problemas Identificados

### 1. Imagem cortada incorretamente ao rotacionar (BUG PRINCIPAL)
O `transform: rotate()` e o `background-image` estao aplicados no **mesmo div** que serve como container de interacao (com `overflow-hidden` no pai). Quando a rotacao e diferente de 0, o div inteiro gira dentro do frame que tem `overflow-hidden` e `rounded corners`, cortando as bordas da imagem e deixando areas vazias visiveis.

### 2. Direcao do drag invertida
O calculo `startOffset.x - dx` subtrai o delta, o que tecnicamente move a imagem na direcao correta para `background-position`. Porem, quando ha rotacao aplicada, o eixo visual muda mas o calculo continua usando eixos fixos, causando confusao na direcao do arraste. Alem disso, o drag precisa considerar o fator de escala para mover proporcionalmente.

### 3. Arquitetura da camada de imagem
Toda a logica visual (background, transform, filter) e de interacao (pointer events) esta misturada num unico div. Isso impede tratar rotacao e escala corretamente sem afetar a area de clique.

## Solucao: Separar camadas de imagem e interacao

### Novo layout do PhonePreview

```text
+-- Phone frame (overflow-hidden, rounded) --------+
|                                                    |
|   +-- Image Layer (inner div) --+                 |
|   |  - backgroundImage           |                 |
|   |  - backgroundSize (scale)    |                 |
|   |  - backgroundPosition        |                 |
|   |  - transform: rotate()       |                 |
|   |  - filter (brightness, etc)  |                 |
|   |  - tamanho 150% do container |                 |
|   |    (para cobrir gaps na      |                 |
|   |     rotacao)                 |                 |
|   +------------------------------+                 |
|                                                    |
|   +-- Interaction Layer (pointer events) -+       |
|   |  - absolute inset-0                    |       |
|   |  - onPointerDown/Move/Up               |       |
|   |  - Move icon overlay                   |       |
|   +----------------------------------------+       |
|                                                    |
|   +-- Camera module (z-20) ---------+             |
|   +-- Apple logo (z-20) ------------+             |
+----------------------------------------------------+
```

### Mudancas tecnicas em `PhonePreview.tsx`

1. **Criar div interno para a imagem**: Um div absolutamente posicionado com dimensoes maiores que o container (ex: 150% width/height, centrado com negative offsets) que recebe `backgroundImage`, `backgroundSize`, `backgroundPosition`, `transform: rotate()` e `filter`. Isso garante que ao rotacionar, nao haja gaps visiveis.

2. **Div separado para interacao**: Um div transparente `absolute inset-0` por cima, que captura os pointer events e mostra o icone de Move. Sem nenhum estilo visual.

3. **Corrigir calculo do drag**: Ajustar a sensibilidade do drag dividindo pelo fator de escala (`scale/100`) para que o movimento seja proporcional ao zoom. Quando a imagem esta em 200%, arrastar deve mover menos em termos de `background-position`.

4. **Upload CTA**: Manter no div de interacao quando nao ha imagem.

### Arquivos modificados

1. **`src/components/PhonePreview.tsx`** -- Refatoracao completa da estrutura de camadas (imagem vs interacao), correcao da direcao de drag e da escala do movimento.

