import { supabase } from "@/integrations/supabase/client";
import type { AiFilter, AiFilterCategory } from "@/lib/customize-types";

export async function fetchActiveAiFilters(): Promise<AiFilter[]> {
  const { data, error } = await supabase
    .from("ai_filters")
    .select("id, name, style_image_url, category_id")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AiFilter[];
}

export async function fetchActiveAiFilterCategories(): Promise<AiFilterCategory[]> {
  const { data, error } = await supabase
    .from("ai_filter_categories")
    .select("id, name, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AiFilterCategory[];
}
