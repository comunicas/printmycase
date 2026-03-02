export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  images: string[];
  colors: ProductColor[];
  specs: ProductSpec[];
  rating: number;
  review_count: number;
  active: boolean | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
