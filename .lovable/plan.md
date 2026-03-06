

## Plano: Organizar controles em Tabs (Ajustes + Filtros IA)

### Ideia
Substituir a lista linear de controles (zoom, rotação, filtros) por duas tabs:
- **Ajustes** — zoom slider + botão de rotação
- **Filtros IA** — lista horizontal de filtros com thumbnails

Isso economiza espaço vertical (especialmente no mobile), separa claramente as funções e permite expandir cada seção no futuro.

### Alterações

**`src/pages/Customize.tsx`**

- Importar `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`
- Substituir o bloco de controles (linhas 266-341) por:
  - `<Tabs defaultValue="ajustes">` envolvendo tudo
  - `<TabsList>` com dois triggers: "Ajustes" (ícone Maximize) e "Filtros IA" (ícone Wand2)
  - `<TabsContent value="ajustes">`: zoom slider + botão de rotação
  - `<TabsContent value="filtros">`: lista horizontal de filtros (conteúdo atual)
- Remover labels redundantes ("Zoom", "Filtros IA") pois as tabs já indicam a seção
- Manter `opacity-50 pointer-events-none` quando não há imagem

### Resultado
- Mobile ganha espaço vertical significativo (só mostra uma seção por vez)
- Desktop também fica mais limpo
- Fácil adicionar futuras tabs (ex: "Texto", "Molduras")

### Arquivo alterado
- `src/pages/Customize.tsx`

