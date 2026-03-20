

## Fluxo de Customização sem Produto Selecionado

### Problema atual
A rota `/customize/:id` exige um slug de produto. CTAs genéricos (ex: "Criar Minha Case" na Landing) levam para `/catalog`, forçando o usuário a navegar pelo catálogo antes de customizar. Não existe rota `/customize` sem slug.

### Solução
Criar uma rota `/customize` (sem `:id`) que exibe uma tela de seleção de modelo antes de qualquer interação de customização.

### Alterações

**1. Nova página `src/pages/SelectModel.tsx`**
- Tela fullscreen com título "Selecione seu modelo" 
- Reutiliza `useProducts()` para listar todos os produtos ativos
- Barra de busca + filtro por marca (reutilizando a lógica do Catalog: `extractBrand`, filtros por marca)
- Grid de cards simplificados (thumbnail + nome + preço) — ao clicar, navega para `/customize/{slug}`
- Header minimalista com botão voltar

**2. `src/App.tsx`**
- Adicionar rota `/customize` (sem param) apontando para `SelectModel`
- Manter rota `/customize/:id` apontando para `Customize`

**3. Atualizar CTAs da Landing (`src/pages/Landing.tsx`)**
- Botão "Criar Minha Case" → navega para `/customize` (sem slug) ao invés de `/catalog`
- Botão "Comece Agora" (CTA final) → idem, `/customize`

**4. Fallback no `src/pages/Customize.tsx`**
- Se `useProduct(id)` retornar produto não encontrado (não loading, mas null), redirecionar para `/customize` (tela de seleção)

### Fluxo resultante

```text
Landing CTA (sem produto) → /customize → Selecionar Modelo → /customize/{slug}
Catalog/Card "Customizar"  → /customize/{slug} (direto, já tem produto)
Product page CTA           → /customize/{slug} (direto, já tem produto)
```

### Detalhes da UI (SelectModel)
- Mesmo estilo visual do Catalog (busca, filtros de marca, grid)
- Cards mais compactos: thumbnail (device_image ou images[0]), nome do modelo (sem "Capa"), preço
- Mobile-first: 2 colunas, desktop 3-4 colunas
- Sem paginação (scroll contínuo, são ~60 produtos ativos)

