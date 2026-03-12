import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Collection = Tables<"collections">;
export type CollectionDesign = Tables<"collection_designs">;

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("collections")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setCollections(data ?? []);
        setLoading(false);
      });
  }, []);

  return { collections, loading };
}

export function useCollection(slug: string | undefined) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [designs, setDesigns] = useState<CollectionDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    (async () => {
      const { data: col } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (!col) { setLoading(false); return; }
      setCollection(col);

      const { data: des } = await supabase
        .from("collection_designs")
        .select("*")
        .eq("collection_id", col.id)
        .eq("active", true)
        .order("sort_order");

      setDesigns(des ?? []);
      setLoading(false);
    })();
  }, [slug]);

  return { collection, designs, loading };
}

export function useDesign(designSlug: string | undefined) {
  const [design, setDesign] = useState<CollectionDesign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!designSlug) { setLoading(false); return; }

    supabase
      .from("collection_designs")
      .select("*")
      .eq("slug", designSlug)
      .eq("active", true)
      .maybeSingle()
      .then(({ data }) => {
        setDesign(data ?? null);
        setLoading(false);
      });
  }, [designSlug]);

  return { design, loading };
}
