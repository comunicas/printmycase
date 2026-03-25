

## Página de Coleções — Landing Page Completa com Vitrines por Coleção

### Visão Geral

Transformar `/colecoes` de uma listagem simples de cards de coleção em uma **landing page pilar** completa, com busca, tags de coleção, CTA fixo, vitrines separadas por coleção e SEO otimizado.

### Layout da Página

```text
┌─────────────────────────────────────────────────┐
│  AppHeader                                       │
├─────────────────────────────────────────────────┤
│  Hero: H1 + subtítulo + campo de busca           │
│  Tags de coleção (chips clicáveis p/ scroll)     │
├─────────────────────────────────────────────────┤
│  Grid: CTA "Personalize" + resultados de busca   │
│  (aparece quando há termo de busca)              │
├─────────────────────────────────────────────────┤
│  Vitrine Coleção 1 (h2 + "Ver tudo >")           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ D1  │ │ D2  │ │ D3  │ │ D4  │               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────────────┤
│  Vitrine Coleção 2 (h2 + "Ver tudo >")           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────────────┤
│  ... mais coleções                               │
├─────────────────────────────────────────────────┤
│  CTA final: "Não encontrou? Personalize!"        │
│  Footer links                                    │
└─────────────────────────────────────────────────┘
```

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/hooks/useCollectionDesigns.ts` | Adicionar hook `useDesignsGroupedByCollection()` — busca **todas** as `collection_designs` ativas com join em `collections(id, name, slug, sort_order)`, agrupa por coleção e ordena coleções por `sort_order`. Retorna `{ collections: { id, name, slug, designs: Design[] }[], allDesigns: Design[], loading }` |
| 2 | `src/pages/Collections.tsx` | Reescrever completamente como landing page pilar |

### Detalhes da página Collections.tsx

**Hero section:**
- `<h1>` "Capinhas Exclusivas para Celular" (SEO-friendly)
- Subtítulo descritivo
- Campo de busca (`<input>` controlado) que filtra designs por nome em tempo real

**Tags de coleção:**
- Chips horizontais scrolláveis com nome de cada coleção
- Click faz scroll suave até a seção da coleção correspondente (`id="colecao-{slug}"`)
- Tag "Todas" ativa por padrão

**CTA fixo:**
- Mesmo card da home ("Personalize sua Capinha") como primeiro item quando busca está ativa, ou como seção destacada no topo

**Vitrines por coleção:**
- Cada coleção vira uma `<section>` com `id="colecao-{slug}"`
- `<h2>` com nome da coleção + link "Ver tudo →" para `/colecao/{slug}`
- Grid 2x2 mobile / 4 colunas desktop com os designs
- Mostra até 8 designs por coleção; se tiver mais, botão "Ver todos os designs"

**Busca:**
- Quando o usuário digita, esconde as vitrines e mostra um grid flat filtrado
- Filtragem client-side por `design.name.toLowerCase().includes(query)`
- CTA fixo como primeiro card no grid de resultados

**SEO (dentro do useEffect):**
- Title: "Capinhas Exclusivas para Celular | PrintMyCase"
- Meta description rica
- Canonical: `/colecoes`
- JSON-LD `CollectionPage` com `ItemList` contendo todos os designs como `Product`
- Open Graph completo
- Hierarquia: `<h1>` página → `<h2>` cada coleção → `<h3>` nomes dos designs nos cards

**CTA final:**
- Seção antes do footer: "Não encontrou o que procura?" + botão para `/customize`

### Hook useDesignsGroupedByCollection

```typescript
// Busca: collection_designs com collections!inner(id, name, slug, sort_order)
// Agrupa designs por collection_id
// Ordena coleções por sort_order
// Retorna estrutura agrupada + flat list para busca
```

