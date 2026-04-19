
User quer lazy-load + skeleton nas imagens da seção "Designs semelhantes" do DesignPage. Já existe `loading="lazy"` nas `<img>`. Falta o skeleton enquanto a imagem carrega.

Já existe `DesignCardSkeleton.tsx` no projeto — mas é um card inteiro, usado durante fetch. Aqui o fetch dos siblings já terminou; o que falta é skeleton **por imagem** enquanto cada `<img>` baixa.

## Solução

Criar um pequeno componente `LazyImage` (ou inline com state) que:
- Mostra `<div className="bg-muted animate-pulse" />` enquanto a imagem não carregou
- Troca para `<img>` no `onLoad`
- Mantém `loading="lazy"` + `decoding="async"`

### Mudanças

**1. Novo componente `src/components/LazyImage.tsx`**
- Props: `src`, `alt`, `width`, `height`, `className`, `wrapperClassName`
- State: `loaded` (boolean)
- Renderiza skeleton absoluto sobre a imagem; remove no `onLoad`
- Reutilizável em outras grids (designs semelhantes, futuras seções)

**2. `src/pages/DesignPage.tsx` — seção "Designs semelhantes"**
- Substituir `<img>` dentro do `aspect-square` pelo `<LazyImage>`
- Manter `group-hover:scale-105` no wrapper

### Fora de escopo
- Não trocar a imagem principal do produto (LCP candidate — precisa ser eager)
- Não mexer em outras grids (Catalog, Collections) — deixar para outra rodada se o user pedir
- Não adicionar blur-up / placeholder colorido (skeleton cinza basta)

### Arquivos
- `src/components/LazyImage.tsx` (novo, ~30 linhas)
- `src/pages/DesignPage.tsx` (1 substituição na seção de siblings)
