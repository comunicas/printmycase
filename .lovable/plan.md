
Objetivo: transformar o frame do celular no principal ponto de entrada para upload, com um CTA visualmente evidente, suave e intuitivo, reforçando que o primeiro passo obrigatório para personalizar a capinha é enviar uma imagem.

## O que será construído

### 1) CTA de upload dentro do frame quando ainda não houver imagem
Adicionar um estado vazio mais forte em `src/components/PhonePreview.tsx`, exibido somente quando `image` for `null`:

- área clicável centralizada dentro do frame
- ícone de câmera/upload com destaque
- título curto e direto, por exemplo:
  - `Envie sua imagem`
- microcopy de apoio, por exemplo:
  - `Toque aqui para começar sua capinha`
- reforço visual de ação primária com glow sutil e animação suave
- clique em qualquer parte do CTA abre o seletor de arquivo já existente

Resultado esperado:
- o frame deixa claro que ele é interativo
- o upload vira o primeiro passo mais óbvio da jornada
- o usuário entende imediatamente o que fazer

### 2) Hierarquia visual orientada à ação
O CTA será desenhado para chamar atenção sem parecer agressivo:

- glow primário usando a linguagem visual já existente
- animação suave de “respiração”/pulse leve, sem distração
- leve destaque no ícone
- texto curto e escaneável
- contraste suficiente sobre o frame vazio

Direção visual:
```text
[ ícone ]
Envie sua imagem
Toque aqui para começar sua capinha
```

### 3) Feedback de hover/tap e acessibilidade
Melhorar a sensação de interação no CTA:

- hover suave no desktop
- active/tap feedback no mobile
- cursor pointer quando não houver imagem
- foco visível para navegação por teclado
- label acessível no input/trigger de upload

### 4) Preservar o comportamento atual após upload
Quando houver imagem carregada:

- o CTA some completamente
- permanece o comportamento atual de arraste/zoom
- continua existindo o botão flutuante de câmera para trocar a imagem
- processamento, safe zone, preview de filtros e badge de resolução seguem intactos

## Arquivos impactados

### `src/components/PhonePreview.tsx`
Mudanças principais:
- adicionar o bloco visual do estado vazio dentro do frame
- conectar esse bloco ao `inputRef.current?.click()`
- aplicar classes de animação/glow somente quando `!image`
- ajustar cursor e affordance do container no estado vazio
- manter intacta a lógica de drag/pinch quando existir imagem

### `src/index.css`
Adicionar utilitários leves para o CTA, reaproveitando o sistema visual atual:
- keyframe sutil de glow/pulse
- classe utilitária para halo suave
- fallback respeitando `prefers-reduced-motion`

Exemplo de intenção:
```text
upload-cta-glow
upload-cta-float/pulse-soft
```

## Comportamento proposto

### Estado sem imagem
- frame mostra CTA central
- CTA pulsa levemente
- glow primário destaca a ação
- clique/toque abre seletor de arquivo
- foco acessível também abre o upload

### Estado com imagem
- CTA desaparece
- interface volta ao modo de edição normal
- botão flutuante de câmera continua servindo para troca de imagem

## Regras de UX que serão respeitadas
- manter a experiência simples e direta
- não adicionar preço/nome ao CTA principal
- não interferir na lógica atual do preview
- não reintroduzir modal inicial nem galeria
- animação discreta, não chamativa demais
- mobile continua priorizando clareza e toque fácil

## Abordagem de implementação
1. Reforçar o estado vazio do `PhonePreview` como “dropzone visual” clicável.
2. Inserir ícone + título + microcopy dentro do frame.
3. Aplicar glow e animação suave com utilitários CSS globais.
4. Garantir que o CTA não conflite com overlays de processamento.
5. Manter a troca de imagem atual no estado preenchido.
6. Ajustar acessibilidade e redução de movimento.

## Check final documentado
Ao finalizar a implementação, validar estes pontos:

### Visual
- o CTA aparece apenas quando ainda não existe imagem
- o CTA fica claramente visível dentro do frame do celular
- ícone, glow e animação estão suaves e coerentes com a marca
- não há poluição visual no desktop nem no mobile

### Interação
- clicar/toque no CTA abre o seletor de imagem
- após selecionar uma imagem, o CTA desaparece
- com imagem carregada, drag/zoom continuam funcionando
- o botão flutuante de câmera continua permitindo trocar a imagem

### Responsividade
- CTA fica bem centralizado no desktop
- CTA continua legível e fácil de tocar no mobile
- não invade header, footer ou controles inferiores

### Acessibilidade
- trigger é navegável por teclado
- possui foco visível
- respeita `prefers-reduced-motion`

### Regressão
- safe zone continua renderizando
- overlay de processamento continua cobrindo corretamente o frame
- preview de filtro e badge de resolução continuam funcionando
- nenhum comportamento da página `/customize/:slug` é quebrado

## Resultado esperado
Depois da mudança, a tela de customização abre já explicando o próximo passo dentro do próprio produto: o frame do celular passa a convidar o usuário a enviar sua imagem com um CTA mais claro, bonito e intuitivo, reduzindo fricção no primeiro passo da jornada.
