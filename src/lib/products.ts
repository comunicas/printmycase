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

  // Query slugs and UUIDs separately to avoid filter injection, then merge
  const [slugResult, uuidResult] = await Promise.all([
    slugs.length > 0
      ? supabase.from("products").select("id, slug, name, images, device_image").in("slug", slugs)
      : Promise.resolve({ data: [] as { id: string; slug: string; name: string; images: string[] | null; device_image: string | null }[] }),
    uuids.length > 0
      ? supabase.from("products").select("id, slug, name, images, device_image").in("id", uuids)
      : Promise.resolve({ data: [] as { id: string; slug: string; name: string; images: string[] | null; device_image: string | null }[] }),
  ]);

  const data = [...(slugResult.data ?? []), ...(uuidResult.data ?? [])];

  const map = new Map<string, ProductInfo>();
  for (const p of data ?? []) {
    const img = p.device_image ?? (p.images as string[] | null)?.[0];
    const info: ProductInfo = { name: p.name, image: img };
    map.set(p.slug, info);
    map.set(p.id, info);
  }

  return map;
}
