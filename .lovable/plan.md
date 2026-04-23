
Objetivo: adicionar um fade no topo do preview do celular, com 10% de altura e transparência máxima de 40%, aplicado sobre a área interna da div selecionada em `PhonePreview`.

### Implementação
1. Atualizar `src/components/PhonePreview.tsx` no container interativo (`absolute inset-0 z-10`) para incluir uma camada visual no topo.
2. Inserir uma `div` absoluta, não-interativa, posicionada no topo:
   - `top: 0`
   - `left: 0`
   - `right: 0`
   - `height: 10%`
   - `pointer-events: none`
3. Aplicar um gradiente com fade vertical:
   - início no topo com 40% de opacidade
   - transição para transparente ao final dos 10%
4. Garantir que a camada fique acima da imagem do preview, mas sem bloquear drag, pinch, upload ou hover do ícone de mover.

### Detalhe técnico sugerido
Usar classes Tailwind equivalentes a algo como:
- `absolute top-0 left-0 right-0 h-[10%] pointer-events-none`
- gradiente: `bg-gradient-to-b from-black/40 to-transparent`

Se o visual precisar ficar mais suave sobre diferentes imagens, a cor base do fade pode ser ajustada para `from-background/40` em vez de preto, mas a primeira opção tende a ficar mais visível no mockup.

### Resultado esperado
- O topo do preview terá uma sobreposição sutil.
- A opacidade começa em 40% e desaparece gradualmente.
- O fade ocupa exatamente os 10% superiores da área interna.
- Nenhuma interação do preview será afetada.

### Arquivo
- `src/components/PhonePreview.tsx`

### Validação
- Confirmar no preview da rota `/customize/iphone-17-pro` que o fade aparece somente no topo.
- Verificar que drag, zoom e clique para trocar imagem continuam funcionando normalmente.
- Conferir desktop e mobile para garantir que o efeito acompanha o tamanho do preview sem distorção.
