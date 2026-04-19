import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface DesignWithCollection {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  price_cents: number;
  collection_slug: string;
}

type CollectionDesignRow = Tables<"collection_designs">;
type CollectionSummary = Pick<Tables<"collections">, "slug">;
type CollectionRow = Pick<Tables<"collections">, "id" | "name" | "slug" | "sort_order">;
type CollectionDesignWithCollectionSummary = CollectionDesignRow & {
  collections: CollectionSummary;
};
type CollectionDesignWithCollection = CollectionDesignRow & {
  collections: CollectionRow;
};

const mapDesign = (
  row: CollectionDesignWithCollectionSummary | CollectionDesignWithCollection,
): DesignWithCollection => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  image_url: row.image_url,
  price_cents: row.price_cents,
  collection_slug: row.collections.slug,
});

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
      const rows = (data ?? []) as CollectionDesignWithCollectionSummary[];
      setDesigns(
        rows.map(mapDesign)
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
        const rows = (data ?? []) as CollectionDesignWithCollection[];
        const flat: DesignWithCollection[] = rows.map(mapDesign);
        setAllDesigns(flat);

        const map = new Map<string, CollectionWithDesigns & { _sortOrder: number }>();
        for (const d of rows) {
          const col = d.collections;
          if (!map.has(col.id)) {
            map.set(col.id, { id: col.id, name: col.name, slug: col.slug, designs: [], _sortOrder: col.sort_order ?? 0 });
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

        const sorted = Array.from(map.values())
          .sort((a, b) => a._sortOrder - b._sortOrder)
          .map(({ _sortOrder, ...rest }) => rest);

        setCollections(sorted);
        setLoading(false);
      });
  }, []);

  return { collections, allDesigns, loading };
}
