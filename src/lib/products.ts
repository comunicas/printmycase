import { supabase } from "@/integrations/supabase/client";

export type ProductInfo = { name: string; image?: string };

/**
 * Resolves product name and first image for a list of product_ids.
 * Handles both UUID and slug identifiers.
 * Returns a Map keyed by the original product_id.
 */
export async function resolveProductInfo(
  productIds: string[]
): Promise<Map<string, ProductInfo>> {
  const unique = [...new Set(productIds)];
  if (unique.length === 0) return new Map();

  const uuids = unique.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  const slugs = unique; // try all as slugs too

  const [bySlug, byId] = await Promise.all([
    supabase.from("products").select("id, slug, name, images").in("slug", slugs),
    uuids.length > 0
      ? supabase.from("products").select("id, slug, name, images").in("id", uuids)
      : Promise.resolve({ data: [] }),
  ]);

  const map = new Map<string, ProductInfo>();
  const allProducts = [...(bySlug.data ?? []), ...(byId.data ?? [])];

  for (const p of allProducts) {
    const img = (p.images as string[] | null)?.[0];
    const info: ProductInfo = { name: p.name, image: img };
    map.set(p.slug, info);
    map.set(p.id, info);
  }

  return map;
}
