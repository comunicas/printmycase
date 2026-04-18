
## Auditoria de assets — Resultado

Inventariei `src/assets/` e `public/` (incluindo `lovable-uploads/`) e validei cada arquivo via grep no código.

### Resultado: zero assets órfãos

| Arquivo | Onde é usado |
|---|---|
| `src/assets/hero-bg-optimized.webp` | `Landing.tsx` (LCP do hero) |
| `public/favicon.ico` | Servido automaticamente pelo browser em `/favicon.ico` |
| `public/logo-printmycase-sm.webp` | `AppHeader`, `IntroDialog`, `CheckoutSuccess`, `Landing` (footer) + preload no `index.html` |
| `public/placeholder.svg` | `Customize.tsx`, `ProductGallery.tsx` (fallback de imagens ausentes) |
| `public/lovable-uploads/stripe-logo-sm.webp` | `PaymentBadges.tsx` |
| `public/googledc7e349a7903758f.html` | Verificação Google Search Console (deve permanecer) |
| `public/llms.txt` | AEO — referenciado em `robots.txt` (memória `mem://seo/aeo-optimization`) |
| `public/robots.txt` | Padrão SEO, servido em `/robots.txt` |

### Conclusão

**Nenhum asset para remover.** A limpeza anterior (Fase 1+2) já eliminou os 6 órfãos que existiam (`logo-printmycase.png` + 5 `ai-showcase-*-sm.webp`). O diretório está enxuto.

### Próximas oportunidades de redução de bundle (fora desta auditoria)

Se quiser continuar reduzindo peso, as oportunidades restantes não são "remover arquivos não usados", mas sim **otimizar arquivos em uso**:

1. **`favicon.ico` (~56 KB)** — já existe plano separado aprovado para gerar versões 16/32/180 px e reduzir para ~5 KB total.
2. **`hero-bg-optimized.webp`** — verificar se já está em qualidade ideal (WebP q=75-80) e dimensão adequada (1920×1080 max).
3. **Auditar `src/integrations/lovable/`** e dependências npm pesadas (fora do escopo "assets").

### Nada a executar

Esta auditoria não requer mudanças de código. Apenas confirma que o diretório está limpo após as fases anteriores.
