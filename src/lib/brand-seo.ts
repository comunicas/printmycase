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
    h1: "Capas para iPhone",
    title: "Capas para iPhone Personalizadas | Studio PrintMyCase",
    description:
      "Crie sua capa personalizada para iPhone com fotos, filtros de IA e acabamento soft-touch premium. Envio para todo o Brasil.",
  },
  samsung: {
    h1: "Capas para Samsung Galaxy",
    title: "Capas para Samsung Galaxy Personalizadas | Studio PrintMyCase",
    description:
      "Capas personalizadas para Samsung Galaxy. Use suas fotos e filtros artísticos com IA. Proteção premium com acabamento soft-touch.",
  },
  motorola: {
    h1: "Capas para Motorola",
    title: "Capas para Motorola Personalizadas | Studio PrintMyCase",
    description:
      "Capas personalizadas para Motorola Moto G e Edge. Envie sua foto, aplique filtros de IA e receba em casa com acabamento premium.",
  },
  xiaomi: {
    h1: "Capas para Xiaomi",
    title: "Capas para Xiaomi Personalizadas | Studio PrintMyCase",
    description:
      "Capas personalizadas para Xiaomi Redmi e Poco. Qualidade premium com impressão HD e acabamento soft-touch.",
  },
  outros: {
    h1: "Capas para Outros Modelos",
    title: "Capas Personalizadas para Celular | Studio PrintMyCase",
    description:
      "Capas personalizadas para diversos modelos de celular. Fotos, filtros de IA e acabamento soft-touch premium.",
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
