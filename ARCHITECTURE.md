# Case Studio — Documentação Estrutural

## Visão Geral

**Case Studio** é uma plataforma de e-commerce para capas de iPhone personalizadas. O usuário escolhe um modelo, envia uma foto, ajusta posição/filtros e finaliza o pedido. Toda a aplicação roda no cliente (SPA) sem backend.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilização | Tailwind CSS 3 + design tokens HSL |
| Componentes UI | shadcn/ui (subset) sobre Radix UI |
| Roteamento | React Router DOM 6 |
| Ícones | Lucide React |

## Hierarquia de URLs

```
/                    → Landing (vitrine + CTA)
/catalog             → Catálogo completo (grid de produtos)
/product/:id         → Detalhes do produto (galeria + specs + cores)
/customize/:id       → Editor de customização (upload + filtros + ajustes)
*                    → 404 (NotFound)
```

### Jornada do Usuário
Landing → Catálogo → Produto → Customizar → (Checkout futuro)

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # Componentes base shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── separator.tsx
│   │   ├── slider.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   ├── AppHeader.tsx     # Header reutilizável com breadcrumbs
│   ├── ControlPanel.tsx  # Controles de ajuste (escala, rotação, brilho, contraste)
│   ├── FilterPresets.tsx # 8 filtros CSS pré-definidos
│   ├── PhonePreview.tsx  # Preview do celular com imagem editável
│   ├── ProductCard.tsx   # Card de produto reutilizável (catálogo + landing)
│   ├── ProductDetails.tsx# Tabs de descrição + especificações
│   ├── ProductGallery.tsx# Galeria de imagens do produto
│   ├── ProductInfo.tsx   # Info do produto (preço, cores, CTAs)
│   ├── SeoHead.tsx       # Meta tags + JSON-LD dinâmico
│   └── StarRating.tsx    # Componente de estrelas reutilizável
├── data/
│   └── products.ts       # Dados mock dos produtos (17 modelos)
├── hooks/
│   └── use-toast.ts      # Hook do sistema de toast
├── lib/
│   └── utils.ts          # Utilitário cn() (clsx + tailwind-merge)
├── pages/
│   ├── Landing.tsx       # Página inicial
│   ├── Catalog.tsx       # Grade de produtos
│   ├── Product.tsx       # Detalhes do produto
│   ├── Customize.tsx     # Editor de customização
│   └── NotFound.tsx      # Página 404
├── App.tsx               # Router principal
├── main.tsx              # Entry point
└── index.css             # Design tokens + Tailwind config
```

## Componentes UI Base (shadcn/ui)

Apenas os componentes efetivamente utilizados pela aplicação:

| Componente | Uso |
|-----------|-----|
| `button` | CTAs, navegação, ações |
| `card` | Cards de produto, benefícios, depoimentos |
| `separator` | Divisores entre seções |
| `slider` | Controles de escala, rotação, brilho, contraste |
| `tabs` | Alternância Ajustes/Filtros no editor |
| `table` | Tabela de especificações do produto |
| `toast/toaster` | Feedback de ações (salvar, checkout) |
| `tooltip` | Tooltips de interface |

## Modelo de Dados

```typescript
interface Product {
  id: string;           // slug (ex: "iphone-17-pro-max")
  name: string;         // nome exibido
  price: number;        // preço em BRL
  description: string;  // descrição do produto
  images: string[];     // URLs das imagens
  colors: ProductColor[];  // opções de cor
  specs: ProductSpec[];    // especificações técnicas
  rating: number;       // nota média (1-5)
  reviewCount: number;  // quantidade de avaliações
}
```

17 modelos disponíveis: iPhone 17 Pro Max, 17 Pro, 17 Air, 17, 15 Pro Max, Xs Max, X/Xs, Xr, X, SE 3, 11 Pro Max, 11 Pro, 11, 7/8 Plus, 7/8, 7 Plus, 7.

## SEO e Dados Estruturados

- **Meta tags**: title, description, Open Graph, Twitter Cards
- **JSON-LD**: Organization, WebSite (com SearchAction), ItemList (produtos)
- **Canonical URL**: dinâmica via `window.location.origin`
- **Lazy loading**: imagens do catálogo
- **Semantic HTML**: `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`

## Convenções de Código

- **Idioma da UI**: Português brasileiro
- **Cores**: Sempre via design tokens HSL (`text-foreground`, `bg-primary`, etc.)
- **Componentes**: Functional components com TypeScript
- **Imports**: Path alias `@/` para `src/`
- **Fonte**: Inter (única fonte carregada)
- **Estado**: useState local (sem state management global)
