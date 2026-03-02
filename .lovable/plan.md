

# Landing Page de Alta Conversao - Case Studio

## Objetivo

Transformar a pagina inicial (`/`) em uma landing page de alta conversao com SEO otimizado, copy persuasiva, CTAs claros e dados estruturados para buscadores e agentes de IA. A pagina de catalogo continua existindo em `/catalog`.

## Hierarquia de URLs (Jornada do Usuario)

```text
/                    →  Landing page (descoberta, convencimento)
/catalog             →  Catalogo completo (escolha do modelo)
/product/:id         →  Detalhes do produto (avaliacao)
/customize/:id       →  Editor de customizacao (criacao)
```

## Estrutura da Landing Page

```text
+-- SEO Meta Tags + JSON-LD Schema.org ---------------------------+

+-- Header -------------------------------------------------------+
|  Case Studio          [Ver Modelos]   [Customizar Agora]        |
+-----------------------------------------------------------------+

+-- Hero Section -------------------------------------------------+
|  "Sua capa, sua identidade."                                    |
|  "Crie capas personalizadas para iPhone com suas fotos e        |
|   designs. Protecao premium com acabamento soft-touch."         |
|  [Customizar Minha Capa →]    [Ver Todos os Modelos]            |
|  ★★★★★ Mais de 1.000 capas criadas                              |
+-----------------------------------------------------------------+

+-- Beneficios (3 colunas) --------------------------------------+
|  🎨 100% Personalizada    🛡️ Protecao Premium   🚚 Frete Gratis |
|  Desc. curta               Desc. curta            Desc. curta   |
+-----------------------------------------------------------------+

+-- Como Funciona (3 passos) ------------------------------------+
|  1. Escolha seu modelo  →  2. Envie sua imagem  →  3. Receba   |
+-----------------------------------------------------------------+

+-- Produtos em Destaque (4 cards mais populares) ----------------+
|  [Card] [Card] [Card] [Card]                                    |
|  [Ver Catalogo Completo →]                                      |
+-----------------------------------------------------------------+

+-- Social Proof / Depoimentos -----------------------------------+
|  "Melhor capa que ja tive!"  "Qualidade incrivel"               |
+-----------------------------------------------------------------+

+-- CTA Final ----------------------------------------------------+
|  "Pronto para criar sua capa unica?"                            |
|  [Comece Agora →]                                               |
+-----------------------------------------------------------------+

+-- Footer SEO ---------------------------------------------------+
|  Links internos: Catalogo | Modelos populares | Contato         |
+-----------------------------------------------------------------+
```

## Arquivos a Criar

### 1. `src/pages/Landing.tsx`
Nova pagina com todas as secoes acima. Importa `products` e `formatPrice` do data. Reutiliza `Card`, `Button`, `Separator` existentes. Secoes:
- **Hero**: headline principal, subtitulo, 2 CTAs (primario navega para `/catalog`, secundario para modelo mais popular)
- **Beneficios**: grid de 3 cards com icones lucide-react (Palette, Shield, Truck)
- **Como Funciona**: 3 passos com icones numerados (Smartphone, Upload, Package)
- **Produtos em Destaque**: 4 primeiros produtos do array `products`, mesmos cards do catalogo, com link "Ver todos"
- **Depoimentos**: 3 depoimentos mockados com nome e estrelas
- **CTA Final**: bloco com fundo primario e botao contrastante
- **Footer**: links internos para catalogo e modelos populares

### 2. `src/components/SeoHead.tsx`
Componente que injeta meta tags e dados estruturados JSON-LD via `document.head` usando `useEffect`:
- Meta tags Open Graph e Twitter Cards
- Schema.org `Organization`, `WebSite` com `SearchAction`
- Schema.org `ItemList` com produtos para rich results
- Canonical URL
- Descricao otimizada para buscadores

## Arquivos a Modificar

### 3. `src/App.tsx`
- Rota `/` passa a renderizar `Landing` em vez de redirect
- Manter rotas `/catalog`, `/product/:id`, `/customize/:id`

### 4. `index.html`
- Atualizar `<title>` para "Case Studio | Capas Personalizadas para iPhone"
- Atualizar meta description com copy otimizada
- Atualizar og:title e og:description

## Detalhes de SEO e AI-Readiness

- **Title tag**: "Case Studio | Capas Personalizadas para iPhone"
- **Meta description**: "Crie capas de celular personalizadas com suas fotos. Protecao premium, acabamento soft-touch e frete gratis. iPhone 17, 15, 11, SE e mais."
- **JSON-LD**: Organization + WebSite + ItemList (produtos)
- **Heading hierarchy**: h1 no hero, h2 por secao, h3 nos cards
- **Links internos**: footer com links para catalogo e modelos populares
- **Semantic HTML**: `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`
- **robots.txt**: ja configurado para permitir todos os crawlers

## Copy de Alta Conversao

- **Headline**: "Sua capa, sua identidade."
- **Sub**: "Transforme suas fotos favoritas em capas de iPhone unicas. Protecao premium com acabamento soft-touch e design 100% seu."
- **CTA primario**: "Criar Minha Capa" (urgencia + posse)
- **CTA secundario**: "Ver Modelos" (baixo compromisso)
- **Social proof**: contagem de capas criadas + depoimentos
- **Beneficios**: focados em dor do cliente (protecao, personalidade, conveniencia)

## Detalhes Tecnicos

- Componentes reutilizados: `Card`, `CardContent`, `Button`, `Separator`
- Icones: `Palette`, `Shield`, `Truck`, `Smartphone`, `Upload`, `Package`, `Star`, `ArrowRight`, `ChevronRight` do lucide-react
- Layout totalmente responsivo com Tailwind
- Scroll suave entre secoes via IDs de ancora
- Sem dependencias novas

