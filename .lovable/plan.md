

## Refatoração da Página de Catálogo

### Problemas atuais

1. **Sem busca por texto** — o usuário não tem como pesquisar por modelo específico (ex: "iPhone 15", "Galaxy S24")
2. **Filtros de marca hardcoded** — lista `BRANDS` é estática; se surgir uma nova marca no banco, não aparece
3. **Sem estado vazio** — quando o filtro não retorna produtos, o grid fica em branco sem feedback
4. **Sem scroll to top** — ao mudar de página, o usuário permanece na posição atual do scroll
5. **Contagem de resultados distante da busca** — fica no canto, pouco visível
6. **Paginação mínima** — sem indicadores de página ou atalhos; apenas setas com "1/3"

### Alterações propostas

**Arquivo: `src/pages/Catalog.tsx`**

1. **Adicionar campo de busca** — `<Input>` com ícone `Search` acima dos filtros de marca. Filtra por `product.name` (case-insensitive, debounce não necessário pois é client-side sobre array já carregado). Reseta página ao digitar.

2. **Derivar marcas dos dados** — ao invés do array `BRANDS` hardcoded, extrair marcas únicas dos produtos carregados via `extractBrand()` + adicionar "Todos" como primeiro item. Assim novas marcas aparecem automaticamente.

3. **Estado vazio** — quando `filtered.length === 0` e não está loading, exibir bloco com ícone `SearchX` + texto "Nenhuma capa encontrada" + sugestão para limpar filtros.

4. **Scroll to top** na mudança de página — `window.scrollTo({ top: 0, behavior: 'smooth' })` no handler de paginação.

5. **Reorganizar header da seção** — busca e filtros ficam em bloco coeso; contagem de resultados fica abaixo dos filtros.

6. **Botão limpar filtros** — quando há busca ou filtro ativo (diferente de "Todos"), exibir botão "Limpar" que reseta ambos.

### Resumo visual

```text
┌─────────────────────────────────┐
│  AppHeader (breadcrumb: Catálogo)│
├─────────────────────────────────┤
│  Nossos Modelos                 │
│  [🔍 Buscar modelo...        ]  │
│  [Todos] [Apple] [Samsung] ...  │
│  12 capas encontradas   [Limpar]│
├─────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │card│ │card│ │card│ │card│   │
│  └────┘ └────┘ └────┘ └────┘   │
│       ...                       │
│       ◀  1 / 3  ▶              │
└─────────────────────────────────┘
```

### Arquivos alterados

- `src/pages/Catalog.tsx` — todas as mudanças acima (busca, marcas dinâmicas, estado vazio, scroll, limpar filtros)

Nenhuma mudança de backend, rotas ou outros componentes.

