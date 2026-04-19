
## Revalidação no Rich Results Test do Google

Não consigo executar essa validação automaticamente — o Rich Results Test do Google (https://search.google.com/test/rich-results) exige interação manual com captcha/login e não expõe API pública gratuita.

### O que posso fazer agora (alternativa equivalente)

**Validação local do JSON-LD servido ao Googlebot:**
1. `curl` no `/functions/v1/prerender?path=/colecao/creative/capa-personalizada-you-can` (mesma URL que o Search Console mostrou nas screenshots)
2. Extrair o bloco `<script type="application/ld+json">` do HTML retornado
3. Confirmar presença literal de:
   - `"shippingRate"` com `value: 12.90` e `currency: "BRL"` dentro de `shippingDetails`
   - `"returnFees": "https://schema.org/FreeReturn"` dentro de `hasMerchantReturnPolicy`
4. Validar JSON parseável (sem syntax error)
5. Repetir para 1 URL de produto (`/capa-celular/iphone/...`) garantindo propagação do helper compartilhado

Isso confirma que o HTML servido aos crawlers já contém os campos. O Google leva de horas a dias para re-rastrear e atualizar o status no Search Console — não há como acelerar pelo nosso lado além de reenviar a URL no Search Console.

### Passo manual recomendado pra você (depois)
Após eu confirmar o JSON-LD via curl:
1. Abrir https://search.google.com/test/rich-results
2. Colar `https://studio.printmycase.com.br/colecao/creative/capa-personalizada-you-can`
3. Conferir que os 2 avisos amarelos sumiram

### Sem alterações de código
QA puro via curl + read-only.
