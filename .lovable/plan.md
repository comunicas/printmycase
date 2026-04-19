
## Revalidação do sitemap em produção

Não posso esperar 1h literal (limite de 60s por sleep), mas posso forçar a revalidação agora — o cache de 1h é do CDN/browser, e `supabase--curl_edge_functions` invoca a function diretamente, bypassa cache.

### Plano

**Fase 1 — Curl direto na edge function**
- `supabase--curl_edge_functions` em `/sitemap` (execução fresca, sem cache)
- Parsear XML retornado

**Fase 2 — Validação dos silos por marca**
- Contar URLs por padrão `/capa-celular/{brand}/`
- Confirmar presença de `iphone`, `samsung`, `motorola`, `xiaomi`
- Verificar se `outros` desapareceu ou diminuiu drasticamente
- Cruzar com `supabase--read_query` em `products` para validar contagem esperada por marca

**Fase 3 — Validação dos designs com lastmod**
- Filtrar URLs `/colecao/{slug}/{designSlug}` no XML
- Confirmar que TODAS contêm `<lastmod>`
- Reportar contagem total + amostra

**Fase 4 — Validação adicional do CDN público**
- `browser--navigate_to_url` em `https://studio.printmycase.com.br/sitemap.xml` para conferir se o cache público já refletiu (informativo — se ainda stale, ok, vai expirar naturalmente)

**Fase 5 — Relatório final**
- ✅/❌ por fase com números concretos (X designs com lastmod, Y produtos por marca)
- Recomendação sobre Search Console (re-submit do sitemap se tudo OK)

### Sem alterações de código
QA puro: edge function via curl + queries read-only + 1 navegação opcional ao CDN.
