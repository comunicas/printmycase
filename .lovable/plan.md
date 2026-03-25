

## Lazy Loading com Skeleton nos Cards de Design

### O que muda

Adicionar lazy loading com Intersection Observer nos cards de design da página `/colecoes`. Enquanto o card não entra no viewport, exibe um skeleton placeholder. Quando entra, renderiza o card real com a imagem.

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/components/DesignCardSkeleton.tsx` | Novo skeleton específico para design cards (aspect-square + nome + preço), sem o botão do ProductCardSkeleton |
| 2 | `src/pages/Collections.tsx` | Envolver cada `DesignCard` com um wrapper que usa `IntersectionObserver` para detectar visibilidade. Mostra `DesignCardSkeleton` até o card entrar no viewport (com margem de 200px para pre-load). Usar um hook inline `useInView` com `useState` + `useEffect` + `useRef`. |

### Comportamento

- Cards fora do viewport: renderizam `DesignCardSkeleton` (placeholder animado)
- Quando o card entra na zona visível (200px de margem): troca para o `DesignCard` real
- Uma vez visível, nunca volta para skeleton (`triggerOnce`)
- O loading inicial da página continua usando `LoadingSpinner` enquanto os dados carregam do banco

### Skeleton Layout

```text
┌──────────────────┐
│                  │  ← aspect-square bg-muted animate-pulse
│                  │
│                  │
├──────────────────┤
│ ████████████     │  ← título (h-3.5)
│ ████████         │  ← título linha 2 (h-3.5 w-2/3)
│ ██████           │  ← preço (h-6 w-20)
└──────────────────┘
```

