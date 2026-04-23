
Objetivo: reduzir a borda da safe zone de `3px` para `1px` sem alterar posição, largura, altura ou os modelos já existentes, e tratar corretamente o erro de publicação `dist upload failed`, separando o que é ajuste de código do que é timeout de infraestrutura no upload do build.

## O que será alterado

### 1) Reduzir a borda da safe zone para 1px
Arquivo:
- `src/components/PhonePreview.tsx`

Implementação:
- trocar a borda atual da overlay da safe zone de `3px` para `1px`
- manter o mesmo contorno preto sólido em todos os safe zones
- preservar o mesmo arredondamento já ajustado no mobile e desktop
- não mexer em:
  - `top`
  - `height`
  - `width`
  - `insetX`
  - lógica de escolha entre `radius` / `mobileRadius`

Resultado esperado:
- safe zone continua com o mesmo shape e mesma geometria
- apenas o traço do contorno fica mais fino e mais próximo da referência

### 2) Restringir a correção apenas aos modelos já existentes
Escopo mantido:
- `iphone-12-pro-max`
- `iphone-15-pro-max`
- `iphone-17-pro`
- `iphone-17-pro-max`
- `iphone-17-air`

Direção:
- não criar novos presets
- não alterar presets fora desses modelos
- não expandir a lógica para novos aparelhos

### 3) Validar visualmente que não houve mudança de geometria
Validação no preview após o ajuste:
- posição da safe zone igual à atual
- largura igual à atual
- altura igual à atual
- apenas a espessura da borda muda de `3px` para `1px`
- mobile continua menos arredondado só nos quatro cantos, como já definido

## Tratamento do erro `dist upload failed`
O erro reportado:
```text
generate R2 credentials ... request canceled (Client.Timeout exceeded while awaiting headers)
```

Interpretação:
- isso indica timeout na etapa de upload/publicação do build
- não aponta para erro de React, TypeScript, Vite ou do código da safe zone
- é um problema de infraestrutura de publicação, não da implementação visual em si

### Como vou tratar isso
1. Aplicar somente a correção de código da borda `3px -> 1px`.
2. Validar que o projeto continua compilando sem erro de código.
3. Tentar nova publicação.
4. Se o mesmo timeout ocorrer de novo, considerar como falha transitória da infraestrutura de upload e não como regressão do app.

### O que não será feito
- não haverá mudanças arbitrárias em `vite.config.ts` só por causa desse erro
- não serão adicionados novos modelos
- não será alterada a geometria da safe zone para “compensar” a borda

## Arquivos impactados
- `src/components/PhonePreview.tsx`

## Abordagem de implementação
1. Trocar a classe/estilo da borda da safe zone de `3px` para `1px`.
2. Manter intactos os presets e a geometria atual.
3. Verificar no preview os mesmos modelos já implementados.
4. Rodar validação de build.
5. Repetir a publicação para confirmar se o timeout era apenas transitório de upload.

## Check final documentado

### Safe zone
- borda preta agora é `1px`
- sem mudança de posição
- sem mudança de largura
- sem mudança de altura
- sem novos modelos
- mobile continua menos arredondado apenas nos quatro cantos

### Publicação
- código validado localmente
- nova tentativa de publicação executada
- se falhar novamente com o mesmo timeout, classificar como problema de infraestrutura de upload e não do app

## Resultado esperado
Depois do ajuste, a safe zone ficará com contorno preto de `1px`, mantendo exatamente a mesma geometria e os mesmos modelos já implementados. Em paralelo, a publicação será reexecutada para confirmar se o erro de `dist upload failed` foi apenas um timeout transitório da infraestrutura de upload.
