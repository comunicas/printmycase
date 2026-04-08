import { supabase } from "@/integrations/supabase/client";

async function uploadImageFromUrl(path: string, src: string) {
  const blob = await fetch(src).then((r) => r.blob());
  await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
}

export async function uploadPendingCustomizationAssets(params: {
  userId: string;
  timestamp: number;
  imageFileName: string | null;
  rawSource: string | null;
  optimizedSource: string | null;
  finalSource: string | null;
  filteredSource: string | null;
  previewSource: string | null;
}) {
  const { userId, timestamp } = params;
  let rawPath: string | null = null;
  let optimizedPath: string | null = null;
  let finalPath: string | null = null;
  let filteredPath: string | null = null;
  let previewPath: string | null = null;

  if (params.rawSource) {
    const ext = params.imageFileName?.split(".").pop() || "png";
    rawPath = `${userId}/pending_raw_${timestamp}.${ext}`;
    await uploadImageFromUrl(rawPath, params.rawSource);
  }

  if (params.optimizedSource) {
    optimizedPath = `${userId}/pending_optim_${timestamp}.jpg`;
    await uploadImageFromUrl(optimizedPath, params.optimizedSource);
  }

  if (params.finalSource) {
    finalPath = `${userId}/pending_final_${timestamp}.jpg`;
    await uploadImageFromUrl(finalPath, params.finalSource);
  }

  if (params.filteredSource) {
    filteredPath = `${userId}/pending_filtered_${timestamp}.jpg`;
    await uploadImageFromUrl(filteredPath, params.filteredSource);
  }

  if (params.previewSource) {
    previewPath = `${userId}/pending_preview_${timestamp}.png`;
    await uploadImageFromUrl(previewPath, params.previewSource);
  }

  return { rawPath, optimizedPath, finalPath, filteredPath, previewPath };
}
