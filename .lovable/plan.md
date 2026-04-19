
## Revisão do Teste E2E — alinhado ao SEO existente

Reli o plano e cruzei com o que já existe na plataforma para garantir consistência:

**Alinhamentos confirmados:**
- `mem://seo/dynamic-sitemap` → sitemap servido via `/functions/v1/sitemap` no domínio `studio.printmycase.com.br` (não `printmycase.lovable.app`). Vou validar lá.
- `mem://integrations/monitoramento-meta-capi` → padrão exige `event_id` compartilhado entre Pixel e CAPI. Vou conferir os dois lados, não só `fbq`.
- `mem://seo/dynamic-meta-pattern` → meta tags são injetadas via `useEffect` no client; o prerender só serve crawlers. Vou validar prerender via `curl` de edge function (não no browser, que executa o React).
- `mem://constraints/seo-performance-limitations` → cache de 1h no sitemap é esperado; se `lastmod` não aparecer, pode ser cache stale, não bug.

### Plano revisado

**Fase 1 — Sitemap (produção real)**
- `supabase--curl_edge_functions` em `/sitemap` (bypassa cache de CDN melhor que browser)
- Confirmar `<lastmod>` em entradas `/colecao/:slug/:designSlug`
- Reportar amostra + contagem

**Fase 2 — Prerender (produção real)**
- `supabase--read_query` para pegar 1 design ativo com `description` preenchida e 1 sem (para validar fallback)
- `supabase--curl_edge_functions` em `/prerender?path=/colecao/:slug/:designSlug` para ambos
- Confirmar `<meta name="description">` reflete a descrição real ou fallback

**Fase 3 — Pixel + CAPI na DesignPage**
- `browser--navigate_to_sandbox` em `/colecao/:slug/:designSlug` (slug obtido na Fase 2)
- `browser--list_network_requests` filtrando `facebook.com/tr` E `meta-capi`
- Validar:
  - Pixel: `ev=ViewContent`, `cd[content_ids]`, `cd[value]`, `cd[currency]=BRL`, `eid` (event_id)
  - CAPI: mesmo `event_id` no payload (dedup conforme memória)
- `browser--read_console_logs` para erros de Clarity/Pixel

**Fase 4 — Relatório**
- ✅/❌ por fase com evidências (trecho XML, payload de rede, descrição comparada)
- Se Pixel bloqueado em sandbox (adblock/preview), reportar e validar via published URL

### Sem alterações de código
QA puro: edge functions via curl + browser apenas para Pixel client-side.
