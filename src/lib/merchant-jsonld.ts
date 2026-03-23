/** Shared merchant listing fields for Google structured data compliance */

const BRAND = { "@type": "Brand" as const, name: "PrintMyCase" };
const SELLER = { "@type": "Organization" as const, name: "PrintMyCase" };

const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails" as const,
  shippingDestination: {
    "@type": "DefinedRegion" as const,
    addressCountry: "BR",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime" as const,
    handlingTime: { "@type": "QuantitativeValue" as const, minValue: 1, maxValue: 3, unitCode: "d" },
    transitTime: { "@type": "QuantitativeValue" as const, minValue: 5, maxValue: 15, unitCode: "d" },
  },
};

const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy" as const,
  applicableCountry: "BR",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 7,
  returnMethod: "https://schema.org/ReturnByMail",
};

export function merchantOffer(price: number, url: string) {
  return {
    "@type": "Offer" as const,
    price,
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url,
    seller: SELLER,
    shippingDetails: SHIPPING_DETAILS,
    hasMerchantReturnPolicy: RETURN_POLICY,
  };
}

export { BRAND };
