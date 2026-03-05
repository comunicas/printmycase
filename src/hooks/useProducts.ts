import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Product } from "@/lib/types";

type ProductRow = Tables<"products">;

export function useProducts(limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (limit === undefined) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    query.then(({ data }) => {
      setProducts(data?.map(mapRow) ?? []);
      setLoading(false);
    });
  }, [limit]);

  return { products, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data ? mapRow(data) : null);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading };
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price_cents: row.price_cents,
    images: row.images ?? [],
    colors: (row.colors as unknown as Product["colors"]) ?? [],
    specs: (row.specs as unknown as Product["specs"]) ?? [],
    rating: Number(row.rating) || 0,
    review_count: row.review_count ?? 0,
    active: row.active ?? true,
    stripe_price_id: row.stripe_price_id,
    stripe_product_id: row.stripe_product_id,
    device_image: row.device_image ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
