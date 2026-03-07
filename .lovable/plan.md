
## Análise e Plano de Refinamento do Hero — V1 Production

### Diagnóstico Atual
O hero usa:
- Background image (`hero-bg.jpg`) com `background-attachment: fixed` para parallax
- Overlay gradiente `from-black/60 via-purple-950/40 to-black/75` (opacidade variável)
- Radial glow centralizado com `hsl(265 83% 57% / 0.40)`
- Conteúdo com `text-white` e `text-white/75` para subtitle

**Problema identificado**: O contraste entre o overlay e o background pode estar gerando leitura comprometida. A imagem de background, se tiver áreas claras ou detalhadas, compete com a copy.

### Estratégia de Refinamento

**Objetivo**: Garantir legibilidade máxima mantendo a estética dark-mode e harmonia de cores roxo/magenta.

#### 1. Ajuste do Overlay Gradient (Linha 55)
Aumentar contraste no topo (título) e mantendo a profundidade:
- **Atual**: `from-black/60 via-purple-950/40 to-black/75`
- **Proposto**: `from-black/75 via-purple-950/50 to-black/80`

Racionário: Aumentar opacidade do topo (60% → 75%) para garantir leitura do h1. Aumentar mid-tone roxo (40% → 50%) para manter harmonia visual. Aumentar base (75% → 80%) para manter separação da próxima seção.

#### 2. Posicionamento Vertical do Conteúdo (Linhas 68-76)
Centralize o conteúdo no viewport visual (não apenas geometricamente). Ajuste para evitar sobreposição com elementos flutuantes.
- Manter `pt-20 pb-16` (padding já bom)
- Confirmar `max-w-3xl` (sem mudança)
- Remover/reduzir radial glow se necessário para não competir com copy

#### 3. Radial Glow (Linhas 57-59)
O glow roxo pode estar competindo com a legibilidade. Opções:
- **A**: Manter `opacity-60` mas mover para background position (topo) — serve como visual interest mas não obscurece copy
- **B**: Reduzir para `opacity-40` (de 60%)
- **Recomendado**: Aumentar X position para 50% but move Y para 20% (topo), deixando a área de copy (centro-infra) com overlay mais limpo

#### 4. Contraste de Texto
- `text-white` no h1: manter
- `text-white/75` no subtitle: aumentar para `text-white/85` para melhor legibilidade
- Adicionar `drop-shadow` no h1 se necessário (já há `drop-shadow-[0_0_24px_hsl(265_83%_57%/0.6)]` no span "personalizada" — bom)

### Implementação

**Arquivo**: `src/pages/Landing.tsx` (linhas 55-59)

**Mudanças**:
1. Linha 55: Ajustar gradient overlay (aumentar contraste)
2. Linha 57-59: Ajustar radial glow position e opacidade
3. Linha 74: Aumentar contraste do subtitle (white/75 → white/85)

**Resultado visual esperado**:
- Copy absolutamente legível contra qualquer background
- Manutenção da estética purple/neon  
- Profundidade visual através do overlay + glow, sem competição com texto
- Alinhamento com brand guidelines (roxo vibrante como accent)
