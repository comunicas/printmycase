
Objetivo: corrigir o plano anterior para deixar claro que o ajuste da safe zone será apenas no mobile e somente no arredondamento dos quatro cantos, reduzindo a curvatura para seguir o mesmo padrão visual do desktop, além de trocar o CTA principal para `Comprar agora`.

## O que será alterado

### 1) Ajustar apenas o arredondamento da safe zone no mobile
A correção da safe zone não vai mexer em posição, largura, altura ou proporção geral.

Implementação:
- atuar somente nos valores de `radius` e `bottomRadius`
- reduzir o arredondamento dos quatro cantos
- usar o desktop como referência visual do quanto a curva deve ficar mais seca
- manter o shape atual, apenas menos redondo

Escopo:
- foco principal nos modelos móveis destacados:
  - `iphone-17-pro`
  - `iphone-17-pro-max`
  - validar consistência com `iphone-17-air` se usar o mesmo padrão visual

Resultado:
- safe zone menos arredondada
- quatro cantos mais próximos da referência desktop
- visual mais técnico e menos “inchado” no topo e nas bordas

### 2) Preservar toda a geometria atual da safe zone
Para evitar desalinhar o preview, a alteração será restrita ao raio dos cantos.

Não será alterado:
- `top`
- `height`
- `width`
- `insetX`
- posicionamento geral da overlay

Resultado:
- o ajuste fica cirúrgico
- o mobile se aproxima do desktop sem criar regressão no enquadramento

### 3) Alterar o CTA principal para “Comprar agora”
O botão principal do `ContinueBar` será atualizado de `Finalizar` para `Comprar agora`.

Implementação:
- trocar apenas o texto principal do botão
- manter ícone, hierarquia e comportamento atual
- manter o loading coerente com compra, sem adicionar ruído visual

Observação:
- isso continua respeitando a preferência do projeto de manter o botão simples, só com rótulo e ícone

## Arquivos impactados

### `src/components/PhonePreview.tsx`
Será ajustado para:
- reduzir o arredondamento da safe zone
- alinhar os quatro cantos ao padrão visual do desktop
- preservar toda a geometria existente

### `src/components/customize/ContinueBar.tsx`
Será ajustado para:
- trocar o label principal para `Comprar agora`
- manter o estado de loading consistente com a ação

## Abordagem de implementação
1. Revisar os presets da safe zone dos modelos afetados.
2. Reduzir apenas `radius` e `bottomRadius`.
3. Garantir que os quatro cantos fiquem menos arredondados no mobile.
4. Preservar posição e tamanho atuais da safe zone.
5. Atualizar o CTA principal para `Comprar agora`.
6. Validar consistência visual entre mobile e a referência do desktop.

## Check final documentado

### Safe zone
- alteração feita apenas no arredondamento
- quatro cantos menos redondos
- mobile visualmente alinhado ao desktop
- sem mudança de posição ou tamanho da overlay

### CTA
- botão principal mostra `Comprar agora`
- continua simples, direto e orientado à conversão

## Resultado esperado
Depois do ajuste, a safe zone mobile ficará menos arredondada nos quatro cantos, seguindo melhor a referência visual do desktop sem mudar sua geometria, e o botão principal da customização passará a usar o texto `Comprar agora`.
