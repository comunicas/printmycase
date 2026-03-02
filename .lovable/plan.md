

# Revisao Completa: Filtros, Hierarquia, Navegacao e Botoes

## Problemas Identificados

### 1. Idioma Inconsistente (Ingles misturado com Portugues)
- Customize: "Adjustments", "Filters", "Save Draft", "Checkout", "Scale", "Rotate", "Bright", "Contrast"
- FilterPresets: "AI Filters", nomes dos filtros em ingles ("Vivid", "Noir", "Warm", "Cool")
- PhonePreview: texto fixo "iPhone 15 Pro Max" independente do produto selecionado

### 2. Navegacao Fragmentada
- Cada pagina tem um header diferente, sem consistencia
- Sem breadcrumbs para contexto de navegacao
- Landing page tem nav completa, mas Catalog/Product/Customize nao
- Botao "Voltar" no Product usa `navigate(-1)` (pode falhar se usuario acessou direto)

### 3. Botoes Sem Funcao
- "Adicionar ao Carrinho" no ProductInfo: nao faz nada
- "Save Draft" no Customize: nao faz nada
- "Checkout" no Customize: nao faz nada
- Botao "Ajuda" desabilitado em todas as paginas

### 4. Filtros Limitados
- Apenas 4 filtros CSS basicos rotulados como "AI" (enganoso)
- Nomes em ingles

---

## Solucao Proposta

### A. Padronizar Idioma para Portugues

**`src/components/ControlPanel.tsx`**
- "Scale" -> "Escala"
- "Rotate" -> "Rotacao"
- "Bright" -> "Brilho"
- "Contrast" -> "Contraste"

**`src/components/FilterPresets.tsx`**
- "AI Filters" -> "Filtros"
- "Vivid" -> "Vibrante"
- "Noir" -> "Preto e Branco"
- "Warm" -> "Quente"
- "Cool" -> "Frio"
- Adicionar mais 4 filtros: "Retro", "Suave", "Dramatico", "Pastel"
- Remover badge "AI" (nao sao filtros de IA reais)

**`src/pages/Customize.tsx`**
- "Adjustments" -> "Ajustes"
- "Filters" -> "Filtros"
- "Save Draft" -> "Salvar Rascunho"
- "Checkout" -> "Finalizar Pedido"

### B. Header/Navegacao Consistente

Criar um componente `src/components/AppHeader.tsx` reutilizavel com:
- Logo "Case Studio" (link para `/`)
- Breadcrumb contextual (ex: Inicio > Catalogo > iPhone 17 Pro Max > Customizar)
- Botao "Ver Modelos" sempre visivel

Aplicar em todas as paginas: Landing, Catalog, Product, Customize.

### C. Corrigir PhonePreview

**`src/components/PhonePreview.tsx`**
- Receber o nome do modelo como prop e exibir dinamicamente em vez de "iPhone 15 Pro Max" fixo

### D. Melhorar Botoes com Feedback

**`src/components/ProductInfo.tsx`**
- Remover "Adicionar ao Carrinho" (nao ha carrinho implementado)
- Manter apenas CTA primario "Customizar Minha Capa"
- Adicionar botao secundario "Ver Catalogo Completo"

**`src/pages/Customize.tsx`**
- "Salvar Rascunho" -> exibir toast "Rascunho salvo!" (feedback visual)
- "Finalizar Pedido" -> exibir toast "Em breve! Estamos preparando o checkout." (placeholder honesto)

### E. Remover Botao de Ajuda Desabilitado

Remover o botao de ajuda (`HelpCircle`) de todas as paginas -- botoes desabilitados sem funcao prejudicam a experiencia.

---

## Arquivos a Criar

1. **`src/components/AppHeader.tsx`** -- Header reutilizavel com logo, breadcrumbs e navegacao

## Arquivos a Modificar

2. **`src/components/ControlPanel.tsx`** -- Traduzir labels para portugues
3. **`src/components/FilterPresets.tsx`** -- Traduzir filtros, adicionar 4 novos, remover badge AI
4. **`src/components/PhonePreview.tsx`** -- Receber `modelName` como prop
5. **`src/components/ProductInfo.tsx`** -- Remover botao carrinho, adicionar link catalogo
6. **`src/pages/Customize.tsx`** -- Traduzir tabs/botoes, passar modelo ao PhonePreview, toasts nos botoes, usar AppHeader
7. **`src/pages/Product.tsx`** -- Usar AppHeader, remover header manual
8. **`src/pages/Catalog.tsx`** -- Usar AppHeader, remover header manual
9. **`src/pages/Landing.tsx`** -- Usar AppHeader no lugar do header atual

