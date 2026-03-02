

# Redesign UX/UI dos Controles de Edicao de Imagem

## Visao Geral
Simplificar os controles de edicao (escala, rotacao, brilho, contraste) com uma interface mais compacta e intuitiva, e adicionar 4 cards de filtros AI (placeholder para processamento futuro).

## Mudancas Planejadas

### 1. Redesign do ControlPanel (`src/components/ControlPanel.tsx`)
- Substituir os 4 sliders separados por controles circulares/compactos em grid 2x2
- Cada controle tera um icone central com valor, e um slider radial ou mini-slider horizontal
- Adicionar botao de reset para cada controle (double-tap/click para resetar ao valor padrao)
- Mover o botao de upload para dentro do preview (overlay)

### 2. Adicionar Secao de Filtros AI (`src/components/FilterPresets.tsx`)
- Criar novo componente com 4 cards de filtros em grid horizontal scrollavel
- Filtros: **Vivid**, **Noir**, **Warm**, **Cool**
- Cada card mostrara um thumbnail da imagem com o filtro aplicado (via CSS filters como preview)
- Badge "AI" indicando que sera processado via AI no futuro
- Ao selecionar, aplica valores pre-definidos de brilho/contraste como preview

### 3. Reorganizar Layout (`src/pages/Index.tsx`)
- Controles ficam abaixo do preview em mobile (fluxo vertical natural)
- Em desktop, controles ficam ao lado direito
- Filtros aparecem como uma faixa horizontal abaixo do preview
- Controles de ajuste fino ficam em uma barra compacta com icones e mini-sliders inline

### 4. Interacao Melhorada no Preview (`src/components/PhonePreview.tsx`)
- Adicionar overlay com botao de upload centralizado quando nao ha imagem
- Botao flutuante de troca de imagem (camera icon) no canto do preview quando ha imagem

## Detalhes Tecnicos

### Estrutura dos Filtros
```text
FilterPresets.tsx
+------------------+------------------+
|   Vivid (AI)     |   Noir (AI)      |
|  [thumbnail]     |  [thumbnail]     |
+------------------+------------------+
|   Warm (AI)      |   Cool (AI)      |
|  [thumbnail]     |  [thumbnail]     |
+------------------+------------------+
```

Cada filtro mapeia para valores CSS:
- **Vivid**: brightness(1.1) contrast(1.2) saturate(1.3)
- **Noir**: brightness(0.9) contrast(1.3) grayscale(1)
- **Warm**: brightness(1.05) sepia(0.3) saturate(1.1)
- **Cool**: brightness(1.05) hue-rotate(15deg) saturate(0.9)

### Controles Compactos
- Substituir sliders longos por controles inline: icone + mini-slider + valor
- Agrupados em uma secao colapsavel ou barra horizontal
- Usar ToggleGroup para alternar entre "Ajustes" e "Filtros"

### Arquivos Modificados
1. **`src/components/ControlPanel.tsx`** - Redesign completo com controles compactos inline
2. **`src/components/FilterPresets.tsx`** - Novo componente de filtros AI
3. **`src/components/PhonePreview.tsx`** - Upload overlay e botao flutuante de troca
4. **`src/pages/Index.tsx`** - Reorganizar layout com tabs Ajustes/Filtros
5. **`src/index.css`** - Estilos adicionais se necessario

### Componentes Utilizados (ja instalados)
- Tabs (radix) para alternar entre Ajustes e Filtros
- Slider (radix) para controles compactos
- Button, Badge do shadcn/ui

