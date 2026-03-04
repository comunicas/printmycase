import { supabase } from "@/integrations/supabase/client";

export type ProductInfo = { name: string; image?: string };

/**
 * Resolves product name and first image for a list of product_ids.
 * Handles both UUID and slug identifiers with a single optimised query.
 * Returns a Map keyed by the original product_id.
 */
export async function resolveProductInfo(
  productIds: string[]
): Promise<Map<string, ProductInfo>> {
  const unique = [...new Set(productIds)];
  if (unique.length === 0) return new Map();

  const uuids = unique.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  const slugs = unique.filter((id) => !/^[0-9a-f-]{36}$/i.test(id));

  // Build a single OR filter covering both slugs and UUIDs
  const conditions: string[] = [];
  if (slugs.length > 0) conditions.push(`slug.in.(${slugs.join(",")})`);
  if (uuids.length > 0) conditions.push(`id.in.(${uuids.join(",")})`);

  const { data } = await supabase
    .from("products")
    .select("id, slug, name, images, device_image")
    .or(conditions.join(","));

  const map = new Map<string, ProductInfo>();
  for (const p of data ?? []) {
    const img = (p as any).device_image ?? (p.images as string[] | null)?.[0];
    const info: ProductInfo = { name: p.name, image: img };
    map.set(p.slug, info);
    map.set(p.id, info);
  }

  return map;
}
