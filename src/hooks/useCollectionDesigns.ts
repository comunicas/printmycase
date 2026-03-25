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
