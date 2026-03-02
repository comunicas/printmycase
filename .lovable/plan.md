

# Modelos de iPhone - Vista Traseira com Cameras em CSS

## Abordagem
Criar frames traseiros dos iPhones em CSS puro com cameras posicionadas proporcionalmente baseado nas dimensoes reais dos dispositivos Apple. As proporcoes serao convertidas de mm para pixels mantendo a fidelidade visual.

## Modelos Incluidos

| Modelo | Dimensoes Reais (mm) | Cameras | Layout |
|--------|----------------------|---------|--------|
| iPhone 11 | 150.9 x 75.7 | 2 lentes | Quadrado, diagonal |
| iPhone 12 | 146.7 x 71.5 | 2 lentes | Quadrado, diagonal |
| iPhone 13 | 146.7 x 71.5 | 2 lentes | Diagonal (sem modulo quadrado) |
| iPhone 14 | 146.7 x 71.5 | 2 lentes | Diagonal |
| iPhone 14 Pro | 147.5 x 71.5 | 3 lentes | Triangulo em quadrado grande |
| iPhone 15 Pro Max | 159.9 x 76.7 | 3 lentes | Triangulo em quadrado grande |
| iPhone 16 Pro Max | 163.0 x 77.6 | 3 lentes + botao captura | Triangulo, modulo maior |

## Arquivos

### 1. `src/lib/phoneModels.ts` (Novo)
Array de modelos com:
- `id`, `name`, `year`
- `aspectRatio` (baseado nas dimensoes reais em mm)
- `borderRadius` (proporcional - iPhones mais antigos tem cantos menores)
- `cameraModule`: `{ top, left, width, height, borderRadius }` em % relativo ao frame
- `lenses`: array de `{ top, left, size }` em % dentro do modulo
- `flash`: `{ top, left }` em % dentro do modulo
- `hasLidar`: boolean (Pro models)
- `color`: cor do frame padrao

### 2. `src/components/PhoneModelSelector.tsx` (Novo)
- Faixa horizontal com scroll dos modelos disponiveis
- Cada opcao mostra uma miniatura simplificada (retangulo com cameras desenhadas)
- Modelo selecionado tem borda azul/primary
- Posicionado acima do preview do telefone

### 3. `src/components/CameraModule.tsx` (Novo)
Componente dedicado para renderizar o modulo de camera:
- Modulo com background escuro semi-transparente e blur
- Cada lente: circulo com gradiente radial (centro escuro -> borda com reflexo)
- Flash: circulo menor amarelado
- LiDAR: circulo pequeno escuro (nos modelos Pro)
- Tudo posicionado com `position: absolute` e valores em %
- `pointer-events: none` e `z-index` acima da imagem

### 4. `src/components/PhonePreview.tsx` (Atualizado)
- Receber nova prop `phoneModel` (objeto do modelo selecionado)
- Usar `aspectRatio` do modelo para definir proporcoes do frame
- Renderizar `CameraModule` sobre a imagem
- Manter largura fixa (~260px) e calcular altura pelo aspect ratio

### 5. `src/pages/Index.tsx` (Atualizado)
- Importar modelos de `phoneModels.ts`
- Adicionar estado `selectedModel` (default: iPhone 15 Pro Max)
- Renderizar `PhoneModelSelector` acima do preview
- Passar modelo selecionado para `PhonePreview`

## Detalhes Tecnicos das Cameras (CSS)

Lente individual:
```text
div {
  border-radius: 50%
  background: radial-gradient(circle, #1a1a2e 40%, #2d2d44 60%, #3d3d55 80%)
  box-shadow: 0 0 0 2px #555, inset 0 1px 3px rgba(0,0,0,0.8)
  width/height: calculado em % do modulo
}
```

Modulo da camera:
```text
div {
  position: absolute
  background: rgba(30, 30, 30, 0.85)
  backdrop-filter: blur(2px)
  border-radius: proporcional ao modelo
  border: 1px solid rgba(255,255,255,0.1)
}
```

## Proporcoes Reais Usadas

Todas as posicoes de camera serao baseadas em medicoes proporcionais reais:
- iPhone 11/12: modulo ocupa ~28% da largura, posicionado a ~3% do topo e ~3% da esquerda
- iPhone 14 Pro/15 Pro: modulo maior (~33% da largura), mesma posicao
- iPhone 16 Pro Max: modulo ainda maior (~35% da largura)
- Lentes: diametro proporcional (~22-26% do modulo)

