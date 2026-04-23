
Objetivo: melhorar `/customize/:slug` em três frentes integradas: feedback claro durante upload/processamento da imagem, acessibilidade real nas abas mobile para teclado/leitor de tela, e animações de entrada/saída mais consistentes em modais e painéis sem quebrar a hierarquia atual.

## Diagnóstico atual

### Upload de imagem
Hoje o usuário só recebe feedback indireto:
- `useCustomize.tsx` controla `isCompressing`, `isRendering`, `processingMsg` e outros estados
- `PhonePreview.tsx` mostra apenas um overlay genérico com spinner e texto curto quando `isProcessing` está ativo
- não existe distinção visual clara entre:
  - imagem selecionada
  - leitura/otimização da imagem
  - imagem pronta para edição
- também não há anúncio acessível de status para leitores de tela

### Abas mobile
Hoje `MobileTabBar.tsx` funciona visualmente, mas ainda está fraco em acessibilidade:
- sem `aria-label` contextual por aba
- sem `aria-controls`, `aria-selected`, `role="tablist"` e `role="tab"`
- foco visível não está explícito o suficiente
- a interação depende muito do visual ativo
- `MobileTabOverlay.tsx` não expõe uma relação semântica clara entre aba e painel

### Modais e elementos com transição
Há base parcial de animação:
- `Dialog` já usa `animate-in/animate-out`
- `MobileTabOverlay` faz fechamento manual com `isClosing`
- `IntroDialog` usa transição própria
- Tailwind já tem keyframes e `tailwindcss-animate`

Mas ainda falta consistência:
- bottom sheet mobile não entra com o mesmo refinamento do restante
- backdrop/header/content poderiam animar separadamente
- alguns diálogos dependem só do comportamento padrão do `DialogContent`
- não há estratégia unificada para reduzir movimento quando o usuário prefere menos animação

## O que será implementado

### 1) Indicador de progresso/estado no upload da imagem
Será refinado o fluxo em `useCustomize.tsx` e `PhonePreview.tsx` para comunicar melhor o estado do upload.

Direção:
- separar o status de upload/otimização em etapas legíveis
- exibir mensagens mais específicas no preview, por exemplo:
  - “Preparando imagem…”
  - “Otimizando para personalização…”
  - “Imagem pronta”
- manter o overlay atual como base, mas com tratamento mais informativo e mais claro para o usuário
- opcionalmente mostrar confirmação breve quando o upload termina, antes de sumir

Estrutura planejada:
- criar um estado derivado de “fase de upload” dentro de `useCustomize.tsx`
- expor esse estado ao `Customize.tsx`
- passar para `PhonePreview.tsx` props como:
  - `uploadState`
  - `uploadStatusLabel`
  - eventualmente `showReadyState`
- manter compatibilidade com `isProcessing` já usado por filtros/renderização

A intenção não é fingir progresso percentual exato onde ele não existe, e sim comunicar estado real de forma confiável.

### 2) Feedback acessível do estado de upload
Além do visual, o estado será anunciado corretamente para tecnologias assistivas.

Implementação planejada:
- adicionar região `aria-live="polite"` para mensagens de status
- marcar o preview/área de upload com `aria-busy` durante compressão/processamento
- garantir que o botão principal de upload tenha nome acessível claro
- manter mensagens curtas e compreensíveis para leitores de tela

Resultado:
- usuário com leitor de tela entende quando a imagem está sendo processada e quando terminou

### 3) Acessibilidade completa nas abas mobile
`MobileTabBar.tsx` e `MobileTabOverlay.tsx` serão ajustados para seguir o padrão semântico de tabs.

Melhorias:
- `role="tablist"` no container das abas
- `role="tab"` em cada botão
- `aria-selected` com base na aba ativa
- `aria-controls` conectando aba ao painel
- `id` estável para cada aba e painel
- `role="tabpanel"` no conteúdo do overlay
- `aria-labelledby` no painel apontando para a aba ativa
- `aria-label`s mais descritivos, por exemplo:
  - “Abrir filtros IA”
  - “Abrir ajustes da imagem”
  - “Abrir detalhes do produto”

Também será incluída navegação por teclado:
- Enter/Espaço continuam acionando naturalmente
- setas esquerda/direita poderão navegar entre abas visíveis
- Home/End poderão ir para primeira/última aba
- foco inicial coerente ao abrir o painel
- foco visível reforçado com `focus-visible:ring-*`

### 4) Melhor foco visível e estados interativos
Os botões das tabs e elementos relevantes do mobile serão ajustados visualmente para acessibilidade sem pesar no layout.

Direção:
- adicionar ring de foco visível consistente com o design system
- reforçar contraste entre estado ativo, hover e foco
- manter aparência clean, sem parecer interface “pesada”
- aplicar o mesmo cuidado ao botão de fechar do overlay e CTA de upload

### 5) Animar entrada e saída de modais e painéis com consistência
Será feito um refinamento transversal nas animações de:
- `MobileTabOverlay`
- diálogos de customização (`FilterConfirmDialog`, `LowResolutionDialog`, `TermsDialog`, `LoginDialog`, `IntroDialog`)
- eventuais elementos auxiliares de estado no preview

Abordagem:
- aproveitar as animações já disponíveis no Tailwind + `tailwindcss-animate`
- padronizar backdrop com fade
- padronizar painéis/cards com combinação leve de fade + scale ou slide
- no mobile, manter o bottom sheet com slide vertical mais suave
- reduzir inconsistências entre componentes que hoje usam lógica manual e componentes Radix

Arquivos principais:
- `src/components/customize/MobileTabOverlay.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/customize/PhonePreview.tsx`
- possivelmente `src/index.css` e/ou `tailwind.config.ts` para classes utilitárias extras

### 6) Respeitar preferência de movimento reduzido
As animações novas serão planejadas com fallback para `prefers-reduced-motion`.

Isso inclui:
- reduzir ou remover slide/scale quando o usuário prefere menos movimento
- preservar apenas mudanças discretas de opacidade quando necessário
- evitar animações longas no fluxo de upload

## Arquivos impactados

### `src/hooks/useCustomize.tsx`
Será ajustado para:
- modelar melhor o estado de upload/otimização
- derivar labels de status mais claras
- expor essas informações ao componente da página

### `src/pages/Customize.tsx`
Será ajustado para:
- passar os novos estados de upload para `PhonePreview`
- manter o restante do fluxo intacto

### `src/components/PhonePreview.tsx`
Será ajustado para:
- exibir indicador de estado mais claro durante upload/processamento
- adicionar `aria-live`, `aria-busy` e mensagens acessíveis
- possivelmente mostrar estado curto de sucesso ao concluir
- refinar transições do overlay/feedback visual

### `src/components/customize/MobileTabBar.tsx`
Será ajustado para:
- estrutura semântica de tabs
- labels acessíveis
- foco visível
- navegação por teclado entre abas

### `src/components/customize/MobileTabOverlay.tsx`
Será ajustado para:
- expor painel com `role="tabpanel"`
- conectar aba e conteúdo por ids/aria
- melhorar animações de entrada/saída
- manter comportamento atual de arrastar para fechar

### `src/components/ui/dialog.tsx`
Será refinado para:
- padronizar melhor as animações open/close em mobile e desktop
- manter a regra do projeto: mobile fullscreen com cantos retos, desktop card central com cantos arredondados

### Diálogos de customização
Serão revisados ao menos:
- `src/components/customize/FilterConfirmDialog.tsx`
- `src/components/customize/LowResolutionDialog.tsx`
- `src/components/customize/TermsDialog.tsx`
- `src/components/customize/LoginDialog.tsx`
- `src/components/customize/IntroDialog.tsx`

Para garantir:
- transições coerentes
- foco visível
- sem regressão de layout

### `src/index.css` e/ou `tailwind.config.ts`
Se necessário, serão ajustados para:
- criar/reusar keyframes utilitários de fade/slide/scale
- centralizar comportamento de motion-safe / reduced-motion

## Abordagem de implementação
1. Estruturar um estado de upload mais explícito no hook de customização.
2. Conectar esse estado ao preview com feedback visual e acessível.
3. Semantizar a tab bar mobile como tabs reais com suporte a teclado.
4. Adicionar foco visível consistente nas tabs e controles relacionados.
5. Padronizar animações de open/close em overlay mobile e diálogos.
6. Revisar `prefers-reduced-motion` para evitar animação excessiva.
7. Validar que upload, filtros, preview, drag/pinch e finalização continuam intactos.

## Regras que serão respeitadas
- não alterar o fluxo funcional de upload
- CTA do frame continua sendo o principal ponto de entrada
- botão “Finalizar” continua sem nome/preço do produto
- tabs mobile mantêm a ordem já aprovada: `Filtros IA`, `Ajustes`, `Detalhes`
- modal mobile continua fullscreen quando aplicável, desktop continua centralizado
- animações devem ser discretas, clean e premium, não chamativas

## Check final documentado

### Upload
- usuário entende quando a imagem começou a ser processada
- usuário entende quando terminou
- mensagens de status ficam mais claras que o “Processando...” genérico
- leitor de tela recebe anúncio de estado

### Acessibilidade
- tabs mobile funcionam com teclado
- foco visível está claro
- roles e aria relationships entre abas e painéis estão corretos
- aba “Detalhes” continua acessível mesmo sem imagem

### Animações
- modais entram e saem com consistência visual
- bottom sheet mobile anima de forma mais refinada
- backdrop e conteúdo têm transição suave
- `prefers-reduced-motion` é respeitado

### Regressão funcional
- upload continua funcionando
- safe zone, arraste, zoom e rotação continuam intactos
- filtros, compare, undo e remove continuam intactos
- diálogos continuam abrindo/fechando corretamente

## Resultado esperado
Depois da implementação, o fluxo de customização ficará mais claro, acessível e polido: o usuário passa a entender melhor o status do upload da imagem, as abas mobile ficam realmente navegáveis por teclado e leitor de tela, e os modais/painéis ganham animações de entrada e saída mais consistentes com a proposta premium da interface.
