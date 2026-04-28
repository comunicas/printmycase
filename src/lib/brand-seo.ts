import { extractBrand } from "@/lib/utils";

/** Brand display name → SEO slug */
const BRAND_SLUG_MAP: Record<string, string> = {
  Apple: "iphone",
  Samsung: "samsung",
  Motorola: "motorola",
  Xiaomi: "xiaomi",
  Outro: "outros",
};

const SLUG_BRAND_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_SLUG_MAP).map(([k, v]) => [v, k])
);

export function brandSlug(displayName: string): string {
  return BRAND_SLUG_MAP[displayName] ?? "outros";
}

export function brandFromSlug(slug: string): string | undefined {
  return SLUG_BRAND_MAP[slug];
}

export function isValidBrandSlug(slug: string): boolean {
  return slug in SLUG_BRAND_MAP;
}

export const ALL_BRAND_SLUGS = Object.values(BRAND_SLUG_MAP);

export interface BrandSeoData {
  h1: string;
  title: string;
  description: string;
}

const BRAND_SEO: Record<string, BrandSeoData> = {
  iphone: {
    h1: "Capinhas Personalizadas para iPhone",
    title: "Capinha Personalizada para iPhone | IA + UV LED | PrintMyCase",
    description: "Crie sua capinha personalizada para iPhone com Inteligência Artificial. Impressão UV LED premium, proteção total e frete grátis para todo o Brasil.",
  },
  samsung: {
    h1: "Capinhas Personalizadas para Samsung Galaxy",
    title: "Capinha Personalizada Samsung Galaxy | IA + UV LED | PrintMyCase",
    description: "Capinhas personalizadas para Samsung Galaxy com IA e impressão UV LED. Proteção premium, cores vibrantes e frete grátis para todo o Brasil.",
  },
  motorola: {
    h1: "Capinhas Personalizadas para Motorola",
    title: "Capinha Personalizada Motorola | IA + UV LED | PrintMyCase",
    description: "Capinhas personalizadas para Motorola Moto G e Edge com IA. Impressão UV LED, acabamento premium e frete grátis para todo o Brasil.",
  },
  xiaomi: {
    h1: "Capinhas Personalizadas para Xiaomi",
    title: "Capinha Personalizada Xiaomi | IA + UV LED | PrintMyCase",
    description: "Capinhas personalizadas para Xiaomi Redmi e Poco com impressão UV LED e IA. Qualidade premium e frete grátis para todo o Brasil.",
  },
  outros: {
    h1: "Capinhas Personalizadas para Celular",
    title: "Capinha Personalizada para Celular | IA + UV LED | PrintMyCase",
    description: "Capinhas personalizadas para todos os modelos de celular. Inteligência Artificial, impressão UV LED e frete grátis para todo o Brasil.",
  },
};

export function getBrandSeo(slug: string): BrandSeoData {
  return (
    BRAND_SEO[slug] ?? {
      h1: "Capas Personalizadas",
      title: "Capas Personalizadas | Studio PrintMyCase",
      description: "Capas personalizadas para celular com acabamento premium.",
    }
  );
}

/** Derive brand slug from product name */
export function brandSlugFromProductName(name: string): string {
  return brandSlug(extractBrand(name));
}
