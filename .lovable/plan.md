

# Redesign da Página de Customização

## O que muda

Substituir o layout atual com **Tabs** (Ajustes / Filtros) por um layout **único e contínuo**, inspirado na referência:

### 1. Seção "Ajustes Básicos" (topo)
- Carrossel horizontal com os presets de filtro (Original, P&B, Vintage, Quente, etc.)
- Thumbnails com preview da imagem do usuário + filtro aplicado
- Setas de navegação `<` `>` nas laterais
- Adicionar preset "Original" (sem filtro) como primeira opção

### 2. Seção "Ajustes Filtros" (abaixo)
- Os 4 sliders (Escala, Rotação, Brilho, Contraste) sempre visíveis
- Mostrar valor atual em tooltip/badge acima do thumb do slider
- Layout idêntico ao atual mas sem estar dentro de tab

### 3. Título "Customizar"
- Adicionar heading `h1` acima das seções no painel direito

### 4. Remover Tabs
- Eliminar `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` do `Customize.tsx`

## Arquivos afetados

- **`src/pages/Customize.tsx`** — remover tabs, layout contínuo com título + carrossel + sliders
- **`src/components/FilterPresets.tsx`** — transformar grid 4x2 em carrossel horizontal com setas, adicionar preset "Original"
- **`src/components/ControlPanel.tsx`** — adicionar label de valor sobre o thumb do slider (tooltip/badge)

