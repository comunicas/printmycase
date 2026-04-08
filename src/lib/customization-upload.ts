import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TIMEOUT_MS = 15000;

const fetchBlobWithTimeout = async (url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Blob> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Falha ao baixar asset: ${response.status}`);
    }
    return await response.blob();
  } finally {
    clearTimeout(timer);
  }
};

interface UploadCustomizationAssetParams {
  sourceUrl: string | null | undefined;
  userId: string;
  fileName: string;
  errorMessage: string;
  upsert?: boolean;
}

export const uploadCustomizationAsset = async ({
  sourceUrl,
  userId,
  fileName,
  errorMessage,
  upsert = false,
}: UploadCustomizationAssetParams): Promise<string | null> => {
  if (!sourceUrl) return null;

  try {
    const blob = await fetchBlobWithTimeout(sourceUrl);
    const path = `${userId}/${fileName}`;
    const { error } = await supabase.storage.from("customizations").upload(path, blob, { upsert });

    if (error) throw error;
    return path;
  } catch {
    throw new Error(errorMessage);
  }
};
