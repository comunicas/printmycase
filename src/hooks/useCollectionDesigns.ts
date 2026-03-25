import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DesignWithCollection {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  price_cents: number;
  collection_slug: string;
}

export function useAllDesigns(limit?: number) {
  const [designs, setDesigns] = useState<DesignWithCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from("collection_designs")
      .select("id, name, slug, image_url, price_cents, collections!inner(slug)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    query.then(({ data }) => {
      setDesigns(
        (data ?? []).map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          image_url: d.image_url,
          price_cents: d.price_cents,
          collection_slug: d.collections.slug,
        }))
      );
      setLoading(false);
    });
  }, [limit]);

  return { designs, loading };
}

export interface CollectionWithDesigns {
  id: string;
  name: string;
  slug: string;
  designs: DesignWithCollection[];
}

export function useDesignsGroupedByCollection() {
  const [collections, setCollections] = useState<CollectionWithDesigns[]>([]);
  const [allDesigns, setAllDesigns] = useState<DesignWithCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("collection_designs")
      .select("id, name, slug, image_url, price_cents, collection_id, collections!inner(id, name, slug, sort_order)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as any[];
        const flat: DesignWithCollection[] = rows.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          image_url: d.image_url,
          price_cents: d.price_cents,
          collection_slug: d.collections.slug,
        }));
        setAllDesigns(flat);

        const map = new Map<string, CollectionWithDesigns>();
        for (const d of rows) {
          const col = d.collections;
          if (!map.has(col.id)) {
            map.set(col.id, { id: col.id, name: col.name, slug: col.slug, designs: [] });
          }
          map.get(col.id)!.designs.push({
            id: d.id,
            name: d.name,
            slug: d.slug,
            image_url: d.image_url,
            price_cents: d.price_cents,
            collection_slug: col.slug,
          });
        }

        const sorted = Array.from(map.values()).sort((a, b) => {
          const aOrder = rows.find((r: any) => r.collections.id === a.id)?.collections.sort_order ?? 0;
          const bOrder = rows.find((r: any) => r.collections.id === b.id)?.collections.sort_order ?? 0;
          return aOrder - bOrder;
        });

        setCollections(sorted);
        setLoading(false);
      });
  }, []);

  return { collections, allDesigns, loading };
}
