# PrintMyCase — Documentação Estrutural

## Visão Geral

**PrintMyCase** é uma plataforma de e-commerce para capas de celular personalizadas. O usuário escolhe um modelo, envia uma foto, ajusta posição/filtros e finaliza o pedido com pagamento via Stripe. A aplicação possui backend completo com autenticação, banco de dados, storage e edge functions.

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
| Analytics | Meta Pixel + Conversions API (CAPI) + Microsoft Clarity |

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
/coins               → Loja de moedas AI [auth]
/collections         → Lista de coleções de designs prontos
/collections/:slug   → Página de coleção individual
/design/:slug        → Página de design de coleção
/knowledge-base      → Central de ajuda (categorias)
/knowledge-base/:cat → Categoria de artigos
/knowledge-base/:cat/:slug → Artigo individual
/legal/:slug         → Documentos legais (termos, privacidade)
/request-model       → Solicitar modelo de celular não disponível
/my-generations      → Galeria de gerações IA do usuário [auth]
/unsubscribe         → Descadastro de emails
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
│   ├── admin/           # AdminSidebar, ProductsTable, ProductFormDialog,
│   │                    # BulkPriceDialog, AiFiltersManager,
│   │                    # AiFilterCategoriesManager, AiGenerationsManager,
│   │                    # AiImageGenerator, ModelRequestsManager,
│   │                    # DeviceImageUpload, CollectionsManager,
│   │                    # CollectionDesignsManager, CoinsManager,
│   │                    # CoinPackagesManager, FaqManager, KbCategoriesManager,
│   │                    # KbArticlesManager, LegalDocsManager, GalleryImagesManager,
│   │                    # ImageGalleriesManager, UserGenerationsManager,
│   │                    # UsersManager, UserDetailDialog, OrdersManager,
│   │                    # OrderDetailDialog, OrderImagesPreviewer,
│   │                    # Pagination, ConfirmDialog, ProductImagesUpload
│   ├── checkout/        # AddressForm, OrderSummary
│   ├── customize/       # AdjustmentsPanel, AiFiltersList, ContinueBar,
│   │                    # CustomizeHeader, FilterConfirmDialog, ImageControls,
│   │                    # LoginDialog, UpscaleConfirmDialog, UploadSpotlight,
│   │                    # IntroDialog, GalleryPicker, GalleryTab, TermsDialog,
│   │                    # ModelSelector
│   ├── forms/           # FormCard, SubmitButton
│   ├── AppHeader.tsx
│   ├── AuthGuard.tsx
│   ├── AdminGuard.tsx
│   ├── PhonePreview.tsx   # Preview do celular com crossfade entre imagens
│   ├── ProductCard.tsx
│   ├── ProductDetails.tsx
│   ├── ProductGallery.tsx
│   ├── ProductInfo.tsx
│   ├── CollectionCard.tsx
│   ├── CoinBalance.tsx
│   ├── ScrollReveal.tsx
│   ├── SeoHead.tsx
│   ├── StarRating.tsx
│   ├── PaymentBadges.tsx
│   ├── PendingCheckoutCards.tsx
│   ├── GoogleIcon.tsx
│   └── UserMenu.tsx
├── contexts/
│   └── AuthContext.tsx   # Provider centralizado de autenticação
├── hooks/
│   ├── useAuth.ts       # Re-exporta useAuthContext
│   ├── useAdmin.ts      # Verifica role admin via has_role()
│   ├── useProducts.ts   # Query de produtos com limite opcional
│   ├── useCoins.ts      # Saldo e transações de moedas AI
│   ├── useCoinSettings.ts # Configurações de custo das moedas
│   ├── useCollections.ts  # Query de coleções e designs
│   ├── useCollectionDesigns.ts # Query de designs de coleção
│   ├── useCustomize.tsx   # Lógica completa do editor de customização
│   ├── usePendingCheckout.ts # Gerenciamento de checkouts pendentes
│   ├── usePendingCount.ts # Contagem de checkouts pendentes
│   ├── useClarityFunnel.ts # Tracking de funil com Clarity
│   ├── useScrollAnimation.ts # Animações baseadas em scroll
│   └── use-toast.ts
├── integrations/
│   ├── supabase/        # Client e types gerados automaticamente
│   └── lovable/         # Integração Lovable Cloud
├── lib/
│   ├── types.ts         # Product, ProductColor, ProductSpec, formatPrice
│   ├── constants.ts     # Constantes da aplicação
│   ├── clarity.ts       # Helpers para Microsoft Clarity
│   ├── meta-pixel.ts    # Helpers para Meta Pixel (pixelEvent, pixelTrackPurchase)
│   ├── customize-types.ts # Tipos do editor de customização (PHONE_W, PHONE_H, DEFAULTS)
│   ├── image-utils.ts   # Utilitários de processamento de imagem (ver Pipeline de Imagens)
│   ├── masks.ts         # Máscaras de input (CEP, telefone)
│   ├── shipping.ts      # Cálculo de frete
│   ├── products.ts      # Helpers de produto
│   ├── seo.ts           # Helpers de SEO
│   ├── merchant-jsonld.ts # JSON-LD para merchant/organization
│   └── utils.ts         # cn() (clsx + tailwind-merge)
├── pages/               # 20+ páginas (maioria com lazy loading)
├── App.tsx              # Router + AuthProvider + Suspense
├── main.tsx
└── index.css            # Design tokens + Tailwind config

supabase/
└── functions/
    ├── _shared/                    # Templates de email (signup, recovery, etc.)
    │   ├── email-templates/        # Templates de auth emails
    │   └── transactional-email-templates/ # Templates transacionais (order status)
    ├── admin-sync-stripe/          # Sincroniza produto individual com Stripe
    ├── apply-ai-filter/            # Aplica filtro IA via Fal.ai (style transfer)
    ├── auth-email-hook/            # Hook de email customizado (templates React)
    ├── bulk-sync-stripe/           # Sincroniza todos os produtos com Stripe
    ├── cleanup-pending-checkouts/  # Limpa checkouts pendentes expirados
    ├── create-checkout/            # Cria Stripe Checkout Session
    ├── create-coin-checkout/       # Cria Stripe Checkout Session para compra de moedas
    ├── delete-account/             # Deleta conta + avatar + cascade
    ├── generate-gallery-image/     # Gera imagens para galeria via IA
    ├── handle-email-suppression/   # Processa bounces/complaints de email
    ├── handle-email-unsubscribe/   # Processa unsubscribe de email
    ├── meta-capi/                  # Envia eventos server-side para Meta Conversions API
    ├── notify-order-status/        # Envia email de atualização de status
    ├── optimize-existing-images/   # Otimiza imagens já existentes no storage
    ├── prerender/                  # Pre-rendering para SEO/bots
    ├── preview-transactional-email/ # Preview de templates transacionais
    ├── process-email-queue/        # Processa fila de emails (pgmq)
    ├── send-transactional-email/   # Envia email transacional via Resend
    ├── sitemap/                    # Geração dinâmica de sitemap.xml
    ├── stripe-webhook/             # Processa eventos do Stripe (payment + Purchase CAPI)
    ├── upload-gallery-zip/         # Upload em lote de imagens de galeria via ZIP
    ├── upscale-image/              # Upscale de imagem via IA
    └── verify-coin-purchase/       # Verifica compra de moedas via webhook
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
  device_image: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### Tabelas do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `products` | Catálogo de produtos com integração Stripe |
| `product_gallery_images` | Imagens compartilhadas da galeria de produtos |
| `orders` | Pedidos com status pipeline (pending → delivered) |
| `pending_checkouts` | Checkouts em andamento (imagens + dados de customização) |
| `addresses` | Endereços de entrega dos usuários |
| `profiles` | Dados adicionais do usuário (nome, avatar, telefone, referral_code) |
| `user_roles` | RBAC — roles `admin` e `user` |
| `ai_filters` | Filtros IA configuráveis (modelo Fal.ai, prompt, imagem de estilo, categoria) |
| `ai_filter_categories` | Categorias para agrupamento dos filtros IA |
| `ai_generated_images` | Imagens geradas por IA (prompt, seed, URLs) |
| `user_ai_generations` | Gerações IA individuais dos usuários (filtros, upscale) |
| `coin_settings` | Configurações do sistema de moedas (custos, bônus) |
| `coin_packages` | Pacotes de moedas disponíveis para compra |
| `coin_transactions` | Histórico de transações de moedas por usuário |
| `collections` | Coleções de designs prontos |
| `collection_designs` | Designs individuais dentro de coleções (com Stripe) |
| `referrals` | Registro de indicações entre usuários |
| `model_requests` | Solicitações de modelos de celular não disponíveis |
| `faqs` | Perguntas frequentes gerenciáveis pelo admin |
| `kb_categories` | Categorias da base de conhecimento |
| `kb_articles` | Artigos da base de conhecimento |
| `legal_documents` | Documentos legais (termos, privacidade) |
| `image_galleries` | Galerias de imagens temáticas |
| `gallery_images` | Imagens dentro de galerias |
| `email_send_log` | Log de envio de emails |
| `email_send_state` | Estado da fila de envio de emails |
| `email_unsubscribe_tokens` | Tokens de descadastro de email |
| `suppressed_emails` | Emails suprimidos (bounces/complaints) |

### Enums

- `app_role`: `admin`, `user`
- `order_status`: `pending`, `paid`, `analyzing`, `rejected`, `customizing` (legado — não usado no frontend), `producing`, `shipped`, `delivered`, `cancelled`
- `coin_transaction_type`: `signup_bonus`, `referral_bonus`, `purchase_bonus`, `coin_purchase`, `ai_usage`, `admin_adjustment`

### Storage Buckets

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `customizations` | Privado | Imagens de customização dos pedidos |
| `avatars` | Público | Fotos de perfil |
| `email-assets` | Público | Assets dos templates de email |
| `product-assets` | Público | Imagens de produtos e dispositivos |

## Pipeline de Imagens

Cada pedido armazena **4 tipos de imagem** no bucket `customizations`:

| # | Nome | Storage path | Descrição |
|---|------|-------------|-----------|
| 1 | **Original** | `{uid}/original_{ts}.{ext}` | Upload cru do usuário, sem nenhum processamento |
| 2 | **Otimizada** | `{uid}/optimized_{ts}.jpg` | Após compressão, filtros IA e/ou upscale |
| 3 | **Recorte** | `{uid}/final_{ts}.jpg` | Arte técnica — snapshot da imagem posicionada no frame lógico (`renderSnapshot`) |
| 4 | **Imagem Posição** | `{uid}/preview_{ts}.png` | Mockup visual do celular — gerada por `renderPhoneMockup()` (canvas 2D com borda arredondada + frame escuro) |

### Funções de renderização (`src/lib/image-utils.ts`)

| Função | Uso |
|--------|-----|
| `compressImage()` | Redimensiona imagens do upload para max 1200×2400 |
| `compressForAI()` | Compressão otimizada para processamento IA (640×1136) |
| `uploadForAI()` | Compress + upload para storage + signed URL para edge functions |
| `getImageResolution()` | Retorna dimensões naturais de uma imagem |
| `getOptimizedUrl()` | Transforma URL de storage em URL otimizada (render/image) |
| `optimizeForUpload()` | Converte File para WebP otimizado (para uploads de produto) |
| `renderSnapshot()` | Gera recorte técnico da imagem no frame lógico (PHONE_W × PHONE_H) |
| `renderPhoneMockup()` | Gera mockup visual do celular com borda arredondada e frame escuro (canvas 2x) |

### Fluxo de persistência

1. **handleContinue** (useCustomize): gera `renderSnapshot` + `renderPhoneMockup`, salva ambos no sessionStorage e no storage (pending checkout)
2. **Checkout**: recupera do sessionStorage ou fallback do DB (via signed URLs, incluindo `previewImagePath`)
3. **create-checkout** (edge function): recebe os 4 paths e grava no `customization_data` do order
4. **OrderImagesPreviewer** (admin): exibe as 4 imagens com lightbox e download direto

## Arquitetura

### Painel Admin

O admin usa layout com `AdminSidebar` (shadcn `Sidebar` com `collapsible="icon"`) + painel principal. Seções são controladas via `useState<AdminSection>` sem rotas — single-page com renderização condicional. A sidebar fecha automaticamente ao selecionar uma seção no mobile. Grupos: Operações (Pedidos, Usuários, Solicitações), Catálogo (Produtos, Coleções, Designs), IA & Galeria, Financeiro, Conteúdo.

Tipos e constantes compartilhados (`statusColorMap`, `AdminOrderRow`, `statusLabels`) ficam centralizados em `src/lib/constants.ts`.

### AuthContext Centralizado

`AuthProvider` encapsula toda a aplicação e gerencia `getSession()` + `onAuthStateChange` em um único listener. Todos os componentes consomem `useAuth()` (re-exportado de `useAuthContext`) sem criar instâncias duplicadas.

Interface: `{ user, profile, loading, signOut, refetchProfile }`

### Lazy Loading de Rotas

Páginas pesadas usam `React.lazy()` com `Suspense` + `LoadingSpinner`:
- **Lazy**: `Admin`, `Catalog`, `Product`, `Customize`, `Checkout`, `Orders`, `Profile`, `Collections`, `CollectionPage`, `DesignPage`, `Coins`, `KnowledgeBase`, `KbCategory`, `KbArticle`, `MyGenerations`
- **Estáticas**: `Landing`, `Login`, `Signup`, `ResetPassword`, `CheckoutSuccess`, `NotFound`, `RequestModel`, `LegalDocument`, `Unsubscribe`

### Filtros IA

O sistema de filtros IA permite aplicar estilos artísticos (style transfer) às imagens do usuário antes da impressão.

**Fluxo:**
1. Admin cadastra filtros na tabela `ai_filters` com modelo Fal.ai, prompt e imagem de estilo
2. Usuário na tela de customização vê os filtros ativos em grid 3 colunas com thumbnails
3. **Long-press (300ms)**: mostra a `style_image_url` do filtro como overlay no PhonePreview com fade-in de 200ms — prévia visual sem custo de IA
4. **Tap curto**: abre modal de confirmação simplificada exibindo apenas o custo em moedas (🪙)
5. Ao confirmar, a edge function `apply-ai-filter` (timeout 120s) envia a imagem para o Fal.ai
6. A imagem filtrada retorna e é exibida com **crossfade de 200ms** (duas camadas sobrepostas)
7. Botão "Remover filtro" reverte para a imagem original

**Persistência:**
- Ao continuar para checkout, a imagem filtrada é salva no storage (`pending_filtered_{ts}.jpg`) e o path + `activeFilterId` são incluídos no `customization_data` do pending checkout
- Ao retornar à customização, o draft restore busca a imagem filtrada via signed URL e restaura `filteredImage` + `activeFilterId`

**Download:**
- URLs cross-origin (fal.ai) são baixadas via `fetch → blob → createObjectURL` para garantir que o atributo `download` funcione corretamente

### Sistema de Moedas AI

Moedas virtuais para uso de recursos de IA (filtros, upscale). Bônus concedido no cadastro, indicação e compra de pedidos. Configurações gerenciadas via `coin_settings`.

### Edge Functions

| Function | Descrição |
|----------|-----------|
| `create-checkout` | Cria Stripe Checkout Session para pedido |
| `create-coin-checkout` | Cria Stripe Checkout Session para compra de moedas |
| `stripe-webhook` | Processa webhooks Stripe + dispara Purchase via Meta CAPI |
| `verify-coin-purchase` | Verifica compra de moedas via webhook Stripe |
| `meta-capi` | Envia eventos server-side para Meta Conversions API |
| `apply-ai-filter` | Aplica filtro IA via Fal.ai (style transfer) |
| `upscale-image` | Upscale de imagem via IA |
| `generate-gallery-image` | Gera imagens para galeria via IA |
| `delete-account` | Deleta conta + avatar + cascade |
| `admin-sync-stripe` | Sincroniza produto com Stripe (valida admin) |
| `bulk-sync-stripe` | Sincroniza todos os produtos com Stripe |
| `notify-order-status` | Envia email ao atualizar status do pedido |
| `auth-email-hook` | Hook de email customizado (templates React) |
| `cleanup-pending-checkouts` | Limpa checkouts pendentes expirados |
| `optimize-existing-images` | Otimiza imagens já existentes no storage |
| `prerender` | Pre-rendering de páginas para SEO/bots |
| `sitemap` | Geração dinâmica de sitemap.xml |
| `send-transactional-email` | Envia email transacional via Resend |
| `process-email-queue` | Processa fila de emails (pgmq) |
| `preview-transactional-email` | Preview de templates transacionais |
| `handle-email-suppression` | Processa bounces/complaints de email |
| `handle-email-unsubscribe` | Processa unsubscribe de email |
| `upload-gallery-zip` | Upload em lote de imagens de galeria via ZIP |

## Analytics e Rastreamento

### Meta Pixel (Browser)

ID: `772617998947470` — script base carregado no `index.html`.

Helper tipado em `src/lib/meta-pixel.ts` com duas funções:
- `pixelEvent(name, params)` — disparo simples sem deduplicação
- `pixelTrackPurchase(value, contentId, eventId)` — Purchase com `eventID` para deduplicação com CAPI

### Meta Conversions API (Server)

Edge function `meta-capi` recebe eventos do `stripe-webhook` e envia para a Graph API do Meta com hashing SHA-256 dos dados do usuário (email, nome, telefone). Autenticada via `CRON_SECRET`.

### Funil de Eventos

| Evento | Tipo | Onde dispara | Dados |
|--------|------|-------------|-------|
| `PageView` | Browser | index.html (automático) | — |
| `ViewContent` | Browser | Product.tsx | `content_name`, `content_ids`, `content_type`, `value`, `currency` |
| `AddToCart` | Browser + Server | useCustomize.tsx | `content_name`, `content_ids`, `content_type`, `value`, `currency` |
| `InitiateCheckout` | Browser | Checkout.tsx | `content_ids`, `content_type`, `value`, `currency` |
| `Purchase` | Browser + Server | CheckoutSuccess.tsx + stripe-webhook | `value`, `currency`, `content_ids` — deduplicado via `event_id` |
| `CompleteRegistration` | Browser | Signup.tsx + LoginDialog.tsx | — |

### Microsoft Clarity

Rastreamento de sessão e heatmaps. Helpers em `src/lib/clarity.ts` para eventos customizados (`clarityEvent`) e tags (`clarityTag`).

## SEO e Dados Estruturados

- **Meta tags**: title, description, Open Graph, Twitter Cards
- **JSON-LD**: Organization, WebSite, ItemList (produtos), Product (detalhe), BreadcrumbList
- **Canonical URL**: dinâmica via `window.location.origin`
- **Lazy loading**: imagens do catálogo
- **Semantic HTML**: `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`
- **SeoHead**: aceita prop `products` para reutilizar dados já carregados

## Segurança

- **RLS**: Todas as tabelas possuem Row Level Security habilitado
- **RBAC**: Roles gerenciadas via tabela `user_roles` + função `has_role()` (SECURITY DEFINER)
- **Admin**: Validação dupla — RLS no banco + verificação server-side nas edge functions
- **Auth**: Email + senha com confirmação de email obrigatória; login social (Google)
- **Storage**: Bucket `customizations` privado; `avatars`, `email-assets` e `product-assets` públicos

## Convenções de Código

- **Idioma da UI**: Português brasileiro
- **Cores**: Sempre via design tokens HSL (`text-foreground`, `bg-primary`, etc.)
- **Componentes**: Functional components com TypeScript
- **Imports**: Path alias `@/` para `src/`
- **Fonte**: Inter (única fonte carregada)
- **Estado**: AuthContext global + useState local (sem state management externo)
- **Preços**: Armazenados em centavos (`price_cents`), formatados via `formatPrice()`
