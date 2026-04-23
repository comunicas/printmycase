
Objetivo: validar e corrigir a safe zone mobile para que fique menos arredondada apenas nos quatro cantos, sem alterar posição/largura/altura nos modelos que já existem hoje, e aplicar borda preta sólida de 3px em todas as safe zones.

## O que será ajustado

### 1) Corrigir somente os modelos já implementados
O ajuste ficará restrito aos modelos que já possuem preset em `src/components/PhonePreview.tsx`.

Modelos atualmente implementados:
- `iphone-12-pro-max`
- `iphone-15-pro-max`
- `iphone-17-pro`
- `iphone-17-pro-max`
- `iphone-17-air`

Direção:
- não adicionar novos modelos
- revisar apenas os presets existentes
- manter o comportamento atual por modelo

### 2) Refinar apenas o arredondamento mobile
A correção do mobile será cirúrgica: mexer só no raio dos quatro cantos.

Escopo:
- revisar `mobileRadius` e `mobileBottomRadius` dos modelos que já usam diferenciação mobile
- se necessário, padronizar o mesmo tratamento mobile apenas nos modelos já existentes
- manter o desktop como referência visual de canto menos arredondado

Não será alterado:
- `top`
- `height`
- `width`
- `insetX`
- posição geral da safe zone

Resultado esperado:
- safe zone mobile menos redonda nos quatro cantos
- mesma geometria atual
- sem deslocamento visual

### 3) Aplicar borda preta de 3px em todas as safe zones
Hoje a safe zone usa apenas preenchimento escuro translúcido. Será adicionada uma borda preta sólida de 3px em todos os casos.

Implementação:
- aplicar `border: 3px solid #000`
- manter o preenchimento interno atual, salvo ajuste fino de contraste se necessário
- garantir que a borda acompanhe exatamente os mesmos raios do shape

Resultado esperado:
- todas as safe zones ficam mais definidas visualmente
- leitura do contorno melhora em qualquer aparelho
- o contorno não altera a posição do overlay

## Arquivo impactado

### `src/components/PhonePreview.tsx`
Será ajustado para:
- revisar os presets existentes da safe zone
- reduzir o arredondamento mobile apenas nos quatro cantos
- preservar posição, largura e altura
- aplicar borda preta de 3px em todas as safe zones

## Validação no preview
Depois da implementação, a validação no preview será feita comparando os modelos já existentes para confirmar:

### Geometria
- posição não mudou
- largura não mudou
- altura não mudou

### Forma
- apenas os quatro cantos ficaram menos arredondados no mobile
- desktop continua como referência
- não houve mudança de shape fora do raio

### Contorno
- todas as safe zones exibem borda preta sólida de 3px
- borda acompanha corretamente o arredondamento de cada preset

## Abordagem de implementação
1. Revisar os presets atuais em `PhonePreview`.
2. Ajustar apenas os raios mobile dos modelos já implementados.
3. Não tocar em `top`, `height`, `width` e `insetX`.
4. Adicionar borda preta de 3px ao elemento da safe zone.
5. Validar no preview os modelos já existentes, sem incluir novos.

## Resultado esperado
Depois da correção, a safe zone mobile ficará menos arredondada somente nos quatro cantos, mantendo exatamente a mesma posição e dimensões atuais nos modelos já implementados, e todas as safe zones passarão a ter borda preta sólida de 3px para um contorno mais preciso.
