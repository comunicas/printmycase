
# Drag-to-Reposition da Imagem no Preview

## Objetivo
Permitir que o usuario arraste a imagem dentro do preview do case para reposiciona-la livremente.

## Abordagem
Adicionar estado de posicao (offsetX, offsetY) e implementar drag nativo via mouse/touch events diretamente no `PhonePreview.tsx`, sem bibliotecas externas.

## Mudancas

### 1. `src/pages/Index.tsx`
- Adicionar estado `position: { x: number, y: number }` (default `{ x: 50, y: 50 }` representando `background-position` em %)
- Passar `position` e `onPositionChange` como props para `PhonePreview`

### 2. `src/components/PhonePreview.tsx`
- Receber novas props `position` e `onPositionChange`
- Usar `backgroundPosition: \`${position.x}% ${position.y}%\`` no estilo da imagem (substituindo o "center" fixo)
- Adicionar refs para tracking de drag: `isDragging`, `startPos`, `startOffset`
- Implementar handlers `onPointerDown`, `onPointerMove`, `onPointerUp` na area do case:
  - **PointerDown**: captura o pointer, registra posicao inicial
  - **PointerMove**: calcula delta em pixels, converte para % baseado no tamanho do container, atualiza posicao
  - **PointerUp**: libera o pointer, finaliza drag
- Mudar cursor para `grab` / `grabbing` durante interacao
- Adicionar `touch-action: none` no CSS para prevenir scroll durante drag em mobile

### 3. Visual feedback
- Cursor `grab` quando hovering sobre a imagem, `grabbing` durante o arrasto
- Indicador sutil (icone de move) aparece brevemente ao passar o mouse sobre a imagem

## Detalhes Tecnicos
- Usar Pointer Events (funciona para mouse e touch)
- Clampar valores de position entre 0% e 100% para nao sair dos limites
- A conversao de pixels para % usa as dimensoes do container (260x532)
- Nenhuma dependencia externa necessaria
