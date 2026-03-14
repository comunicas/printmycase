

## Melhorar UX da Página de Catálogo

### Problemas atuais
- Ordenação por número do modelo (confusa) em vez de alfabética
- Search bar genérica sem feedback visual rico
- Filtros de marca sem contagem de resultados
- Cards sem destaque visual suficiente no mobile (390px)
- Sem indicação visual de qual filtro está ativo além da cor do botão

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/pages/Catalog.tsx` | Redesign completo da seção de busca, filtros e grid |
| `src/components/ProductCard.tsx` | Ajustes visuais nos cards para melhor hierarquia |

### Catalog.tsx — Mudanças

**1. Ordenação alfabética por nome**
Substituir sort por número do modelo → `a.name.localeCompare(b.name)` simples.

**2. Search bar melhorado**
- Input maior com border mais visível e foco com anel roxo
- Botão de limpar (X) dentro do input quando há texto digitado
- Placeholder mais descritivo: "Buscar por modelo, ex: iPhone 16..."
- Transição suave no ícone de busca

**3. Filtros de marca com contagem**
- Cada chip de marca mostra quantidade: "Samsung (12)"
- Chip selecionado com estilo mais destacado (primary com glow sutil)
- Scroll horizontal com gradiente fade nas bordas para indicar mais opções

**4. Resultado e layout**
- Contagem de resultados com texto mais expressivo: "Mostrando 12 de 45 capas"
- Grid: manter 2 colunas no mobile, mas com gap menor (gap-3) para cards maiores
- Animação de entrada nos cards (fade-in staggered via CSS)

**5. Paginação melhorada**
- Mostrar botões numéricos das páginas (até 5 páginas visíveis)
- Estilo mais claro para página ativa

### ProductCard.tsx — Ajustes

- Padding interno reduzido (p-2.5) para aproveitar melhor o espaço no mobile
- Nome do produto com `text-[13px]` no mobile para caber melhor
- Badge com preço mais destacado (fundo accent sutil)
- Remover StarRating para simplificar o card (foco em nome + preço + CTA)

### Estrutura visual (mobile 390px)

```text
┌────────────────────────────────┐
│ 🔍 Buscar por modelo...    [X]│  ← input com clear button
├────────────────────────────────┤
│ [Todos(45)] [Apple(18)] [Sam→  │  ← chips com contagem + fade
├────────────────────────────────┤
│ Mostrando 12 de 45      Limpar│
├───────────────┬────────────────┤
│  ┌─────────┐  │  ┌─────────┐  │
│  │  img     │  │  │  img     │ │
│  │ iPhone16 │  │  │ GalaxyA │ │
│  │ R$69,90  │  │  │ R$69,90 │ │
│  │[Customi] │  │  │[Customi]│ │
│  └─────────┘  │  └─────────┘  │
├───────────────┴────────────────┤
│      ‹  1  [2]  3  4  ›       │  ← paginação numérica
└────────────────────────────────┘
```

