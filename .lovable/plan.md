
## Solicitar indexação no Search Console

Isso é uma ação **manual no Google Search Console** — não é algo que eu execute por código. Não há API pública gratuita para "Solicitar indexação" (a Indexing API do Google é restrita a `JobPosting` e `BroadcastEvent`, não vale para páginas de produto/coleção).

### Passo a passo (faça você mesmo, leva ~30s por URL)

1. Abra https://search.google.com/search-console
2. Selecione a propriedade `studio.printmycase.com.br`
3. Na barra superior **"Inspecionar qualquer URL"**, cole a URL completa, ex:
   `https://studio.printmycase.com.br/colecao/creative/capa-personalizada-um-dia-de-cada-vez`
4. Aguarde o teste (5-15s)
5. Clique em **"SOLICITAR INDEXAÇÃO"** (botão visível na sua última screenshot)
6. Confirme — Google enfileira para re-rastreamento prioritário (horas a 1-2 dias vs. semanas naturais)

### URLs prioritárias para reenviar

Sugiro reenviar 1 representativa de cada tipo (o helper `merchantOffer()` é compartilhado, então validar uma URL por tipo cobre o resto):

- **1 design**: `/colecao/creative/capa-personalizada-um-dia-de-cada-vez` (a que você já testou)
- **1 coleção**: `/colecao/creative`
- **1 produto**: `/capa-celular/iphone/<um-modelo-popular>`
- **Sitemap**: em **Sitemaps** → reenviar `https://studio.printmycase.com.br/sitemap.xml` (força Google a redescobrir todas as URLs com os novos schemas)

### Limites

- Google limita ~10-12 solicitações manuais/dia por propriedade
- Re-indexação não é instantânea mesmo após solicitar (1h a 2 dias é normal)
- Status na aba **Aprimoramentos → Listagens do comerciante** demora 7-14 dias para refletir agregadamente

### O que eu posso fazer (se quiser)

Se quiser uma alternativa automatizada por código, opções viáveis:

1. **Pingar o sitemap** programaticamente após mudanças relevantes via edge function (`GET https://www.google.com/ping?sitemap=...`) — Google deprecou em jun/2023, então **não funciona mais**.
2. **Adicionar `lastmod` dinâmico no sitemap** com a data da última alteração de produto/coleção — sinaliza ao Googlebot quais URLs revisitar primeiro no próximo crawl natural. Isso **eu posso implementar** se quiser (editar `supabase/functions/sitemap/index.ts`).

Me diga se quer que eu implemente a opção 2 (`lastmod` dinâmico) ou se prefere só fazer o passo manual no GSC.
