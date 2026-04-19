
## Diagnóstico dos avisos do Google Search Console

As imagens mostram **avisos amarelos opcionais**, não erros. A URL `/colecao/creative/capa-personalizada-you-can` foi validada com sucesso — o schema renderizou inteiro (Offer, shippingDetails, MerchantReturnPolicy, AggregateRating 4.9 / 50 ✅). Os dois avisos:

### 1. `shippingRate` não encontrado (em `shippingDetails`)
Google sugere declarar o **custo do frete** explicitamente (`shippingRate: { value, currency }`). Hoje só temos `shippingDestination` + `deliveryTime`.

### 2. `returnFees` não encontrado (em `hasMerchantReturnPolicy`)
Google sugere declarar quem paga o frete da devolução (`returnFees: FreeReturn` ou `ReturnShippingFees`).

Ambos são **opcionais** — não bloqueiam indexação nem rich results. Mas preencher melhora elegibilidade para **Merchant Listings** (badges de envio/devolução nos resultados de busca, mais CTR).

### O que vou fazer

Atualizar **`src/lib/merchant-jsonld.ts`** (helper compartilhado — propaga automaticamente para Product, DesignPage e CollectionPage):

**A. Adicionar `shippingRate` em `SHIPPING_DETAILS`:**
```ts
shippingRate: { "@type": "MonetaryAmount", value: <X>, currency: "BRL" }
```

**B. Adicionar `returnFees` em `RETURN_POLICY`:**
```ts
returnFees: "https://schema.org/FreeReturn" // ou ReturnShippingFees
```

### Antes de implementar — preciso de 2 decisões de negócio

**Custo do frete (`shippingRate`):**
- Frete grátis (R$ 0) → exibe badge "Frete grátis" no Google
- R$ 15 (PAC médio)
- R$ 20 (Sedex médio)
- Buscar de `src/lib/shipping.ts` (se já existir valor padrão configurado)

**Política de devolução (`returnFees`):**
- Cliente paga (`ReturnShippingFees`) — padrão CDC
- Loja paga (`FreeReturn`) — exibe badge "Devolução grátis", mais atrativo

Me diga as 2 escolhas e eu aplico em 1 edit (o helper centralizado garante que propaga em todas as páginas que usam `merchantOffer()`).
