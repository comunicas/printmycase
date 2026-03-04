# ArtisCase — Documentação Estrutural

## Visão Geral

**ArtisCase** é uma plataforma de e-commerce para capas de celular personalizadas. O usuário escolhe um modelo, envia uma foto, ajusta posição/filtros e finaliza o pedido com pagamento via Stripe. A aplicação possui backend completo com autenticação, banco de dados, storage e edge functions.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilização | Tailwind CSS 3 + design tokens HSL |
| Componentes UI | shadcn/ui (subset) sobre Radix UI |
| Roteamento | React Router DOM 6 |
| Ícones | Lucide React |
| Backend | Supabase (DB + Auth + Storage + Edge Functions) |
| Pagamentos | Stripe (Checkout Sessions) |

## Hierarquia de URLs

```
/                    → Landing (vitrine + CTA)
/catalog             → Catálogo completo (grid de produtos)
/product/:id         → Detalhes do produto (galeria + specs + cores)
/customize/:id       → Editor de customização (upload + filtros + ajustes) [auth]
/checkout/:id        → Checkout com endereço + pagamento Stripe [auth]
/checkout/success    → Confirmação de pedido
/orders              → Histórico de pedidos do usuário [auth]
/profile             → Perfil do usuário (dados + avatar + endereços) [auth]
/admin               → Painel admin (produtos + pedidos) [auth + admin]
/login               → Login
/signup              → Cadastro
/reset-password      → Recuperação de senha
*                    → 404 (NotFound)
```

### Jornada do Usuário
Landing → Catálogo → Produto → Customizar → Checkout → Pedidos

### Proteção de Rotas
- `AuthGuard`: redireciona para `/login` se não autenticado
- `AdminGuard`: redireciona para `/` se não possui role `admin`

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # Componentes base shadcn/ui
│   ├── admin/           # ProductsTable, ProductFormDialog, BulkPriceDialog
│   ├── checkout/        # AddressForm, OrderSummary
│   ├── forms/           # FormCard, SubmitButton
│   ├── AppHeader.tsx
│   ├── AuthGuard.tsx
│   ├── AdminGuard.tsx
│   ├── ControlPanel.tsx
│   ├── FilterPresets.tsx
│   ├── PhonePreview.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetails.tsx
│   ├── ProductGallery.tsx
│   ├── ProductInfo.tsx
│   ├── SeoHead.tsx
│   ├── StarRating.tsx
│   └── UserMenu.tsx
├── contexts/
│   └── AuthContext.tsx   # Provider centralizado de autenticação
├── hooks/
│   ├── useAuth.ts       # Re-exporta useAuthContext
│   ├── useAdmin.ts      # Verifica role admin via has_role()
│   ├── useProducts.ts   # Query de produtos com limite opcional
│   └── use-toast.ts
├── integrations/
│   └── supabase/        # Client e types gerados automaticamente
├── lib/
│   ├── types.ts         # Product, ProductColor, ProductSpec, formatPrice
│   ├── constants.ts     # Constantes da aplicação
│   ├── masks.ts         # Máscaras de input (CEP, telefone)
│   ├── shipping.ts      # Cálculo de frete
│   ├── products.ts      # Helpers de produto
│   └── utils.ts         # cn() (clsx + tailwind-merge)
├── pages/               # 13 páginas (7 com lazy loading)
├── App.tsx              # Router + AuthProvider + Suspense
├── main.tsx
└── index.css            # Design tokens + Tailwind config

supabase/
└── functions/
    ├── _shared/          # Templates de email (signup, recovery, etc.)
    ├── admin-sync-stripe/    # Sincroniza produto individual com Stripe
    ├── auth-email-hook/      # Hook de email customizado (templates React)
    ├── bulk-sync-stripe/     # Sincroniza todos os produtos com Stripe
    ├── create-checkout/      # Cria Stripe Checkout Session
    ├── delete-account/       # Deleta conta + avatar + cascade
    ├── notify-order-status/  # Envia email de atualização de status
    └── stripe-webhook/       # Processa eventos do Stripe (payment_intent)
```

## Modelo de Dados

### Interface Product (frontend)

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  images: string[];
  colors: ProductColor[];
  specs: ProductSpec[];
  rating: number;
  review_count: number;
  active: boolean;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### Tabelas do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `products` | Catálogo de produtos com integração Stripe |
| `orders` | Pedidos com status pipeline (pending → delivered) |
| `addresses` | Endereços de entrega dos usuários |
| `profiles` | Dados adicionais do usuário (nome, avatar, telefone) |
| `user_roles` | RBAC — roles `admin` e `user` |

### Enums

- `app_role`: `admin`, `user`
- `order_status`: `pending`, `paid`, `analyzing`, `customizing`, `producing`, `shipped`, `delivered`, `cancelled`

### Storage Buckets

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `customizations` | Privado | Imagens de customização dos pedidos |
| `avatars` | Público | Fotos de perfil |
| `email-assets` | Público | Assets dos templates de email |

## Arquitetura

### AuthContext Centralizado

`AuthProvider` encapsula toda a aplicação e gerencia `getSession()` + `onAuthStateChange` em um único listener. Todos os componentes consomem `useAuth()` (re-exportado de `useAuthContext`) sem criar instâncias duplicadas.

Interface: `{ user, profile, loading, signOut, refetchProfile }`

### Lazy Loading de Rotas

Páginas pesadas usam `React.lazy()` com `Suspense` + `LoadingSpinner`:
- **Lazy**: `Admin`, `Catalog`, `Product`, `Customize`, `Checkout`, `Orders`, `Profile`
- **Estáticas**: `Landing`, `Login`, `Signup`, `ResetPassword`, `CheckoutSuccess`, `NotFound`

### Edge Functions

| Function | JWT | Descrição |
|----------|-----|-----------|
| `create-checkout` | Não | Cria Stripe Checkout Session para o pedido |
| `stripe-webhook` | Não | Processa webhooks do Stripe (pagamento confirmado) |
| `delete-account` | Não* | Deleta conta do usuário (valida JWT manualmente) |
| `admin-sync-stripe` | Não* | Sincroniza produto com Stripe (valida admin server-side) |
| `bulk-sync-stripe` | — | Sincroniza todos os produtos com Stripe |
| `notify-order-status` | — | Envia email ao atualizar status do pedido |
| `auth-email-hook` | Não | Hook de email customizado com templates React |

\* Validação de JWT feita manualmente dentro da function.

## SEO e Dados Estruturados

- **Meta tags**: title, description, Open Graph, Twitter Cards
- **JSON-LD**: Organization, WebSite, ItemList (produtos)
- **Canonical URL**: dinâmica via `window.location.origin`
- **Lazy loading**: imagens do catálogo
- **Semantic HTML**: `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`
- **SeoHead**: aceita prop `products` para reutilizar dados já carregados

## Segurança

- **RLS**: Todas as tabelas possuem Row Level Security habilitado
- **RBAC**: Roles gerenciadas via tabela `user_roles` + função `has_role()` (SECURITY DEFINER)
- **Admin**: Validação dupla — RLS no banco + verificação server-side nas edge functions
- **Auth**: Email + senha com confirmação de email obrigatória
- **Storage**: Bucket `customizations` privado; `avatars` e `email-assets` públicos

## Convenções de Código

- **Idioma da UI**: Português brasileiro
- **Cores**: Sempre via design tokens HSL (`text-foreground`, `bg-primary`, etc.)
- **Componentes**: Functional components com TypeScript
- **Imports**: Path alias `@/` para `src/`
- **Fonte**: Inter (única fonte carregada)
- **Estado**: AuthContext global + useState local (sem state management externo)
- **Preços**: Armazenados em centavos (`price_cents`), formatados via `formatPrice()`
