

## Corrigir "Listagens do comerciante" inválidas no Google Search Console

### Problema

O Google Search Console detectou 4 itens inválidos em "Listagens do comerciante" (Merchant Listings). Isso ocorre porque o structured data `Product` está faltando campos obrigatórios para merchant listings: `description`, `brand`, `sku`/`gtin`/`mpn` (ou `identifier_exists: false`), e `shippingDetails`.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/components/SeoHead.tsx` | Adicionar campos obrigatórios ao Product no ItemList: `description`, `brand`, `sku` (usar slug), `hasMerchantReturnPolicy`, `shippingDetails` |
| 2 | `src/pages/Product.tsx` | Adicionar ao JSON-LD do Product: `sku` (slug), `aggregateRating`, `hasMerchantReturnPolicy`, `shippingDetails` |
| 3 | `src/pages/DesignPage.tsx` | Mesmos campos adicionais ao JSON-LD Product |
| 4 | `src/pages/CollectionPage.tsx` | Mesmos campos adicionais ao Product dentro do ItemList |

### Campos adicionados em todos os Product schemas

```json
{
  "@type": "Product",
  "name": "...",
  "description": "Capa personalizada para ...",
  "image": "...",
  "sku": "slug-do-produto",
  "brand": { "@type": "Brand", "name": "PrintMyCase" },
  "offers": {
    "@type": "Offer",
    "price": 69.90,
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "url": "...",
    "seller": { "@type": "Organization", "name": "PrintMyCase" },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "BR"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 5, "maxValue": 15, "unitCode": "d" }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "BR",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail"
    }
  }
}
```

Isso resolve os 4 itens inválidos adicionando os campos que o Google exige para merchant listings.

