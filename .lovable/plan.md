

## Preparar o site para AI Agents (AEO — Answer Engine Optimization)

### Status atual

O site já tem uma boa base de SEO tradicional:
- JSON-LD estruturado (Product, ItemList, BreadcrumbList, CollectionPage)
- Sitemap dinâmico
- Meta tags OG/Twitter
- Prerender edge function para crawlers

**O que falta** para AI agents (ChatGPT, Perplexity, Google AI Overview, Claude):

### Alterações necessárias

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `public/llms.txt` | Criar arquivo padrão [llms.txt](https://llmstxt.org/) — fornece aos LLMs um resumo legível do site, catálogo e links principais |
| 2 | `public/robots.txt` | Adicionar regras `Allow` para os principais AI crawlers (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended) e referenciar o `llms.txt` |
| 3 | `src/lib/merchant-jsonld.ts` | Adicionar `FAQPage` schema helper para páginas de FAQ (melhora chances de aparecer em AI answers) |
| 4 | `src/pages/KnowledgeBase.tsx` | Injetar JSON-LD `FAQPage` com perguntas/respostas reais do banco — AI agents usam FAQ schema como fonte primária |

### Detalhes técnicos

**1. `public/llms.txt`** — Arquivo de texto simples que AI agents buscam automaticamente:
```text
# PrintMyCase

> Capas de celular personalizadas com suas fotos. Proteção premium, acabamento soft-touch.

## Páginas principais
- Catálogo de modelos: https://studio.printmycase.com.br/catalog
- Coleções de designs: https://studio.printmycase.com.br/colecoes
- Personalizar capa: https://studio.printmycase.com.br/customize
- Central de ajuda: https://studio.printmycase.com.br/ajuda
- Solicitar modelo: https://studio.printmycase.com.br/solicitar-modelo

## Sobre
PrintMyCase é uma loja online brasileira de capas personalizadas para celular.
Oferecemos mais de 70 modelos (Samsung, Motorola, iPhone e mais).
O cliente pode enviar sua própria foto ou escolher designs de nossas coleções.
Todas as capas têm acabamento soft-touch e proteção premium.

## Políticas
- Termos de uso: /termos
- Política de privacidade: /privacidade
- Política de compras: /compras
```

**2. `robots.txt`** — Adicionar AI crawlers:
```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /
```

**3-4. FAQ Schema** — Injetar `FAQPage` JSON-LD na página `/ajuda` com as perguntas da tabela `kb_articles`, pois AI agents priorizam conteúdo estruturado como FAQ para gerar respostas.

### O que NÃO precisa mudar
- Os JSON-LD de Product/Collection já estão completos
- O sitemap já cobre todas as rotas
- O prerender já serve meta tags para crawlers sem JS

