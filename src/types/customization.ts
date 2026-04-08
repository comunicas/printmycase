import type { Json } from "@/integrations/supabase/types";

export type CustomizationPosition = {
  x: number;
  y: number;
};

export type PendingCustomizationData = {
  scale?: number;
  position?: CustomizationPosition;
  rotation?: number;
  activeFilter?: string | null;
  filteredImagePath?: string | null;
  previewImagePath?: string | null;
  filterHistory?: string[];
};

export type OrderCustomizationData = {
  rawImage?: string | null;
  image?: string | null;
  editedImage?: string | null;
  previewImage?: string | null;
  imageFileName?: string | null;
  scale?: number;
  position?: CustomizationPosition;
  rotation?: number;
  activeFilter?: string | null;
  filteredImagePath?: string | null;
  previewImagePath?: string | null;
  filterHistory?: string[];
  rawImageUrl?: string | null;
  originalImageUrl?: string | null;
  editedImageUrl?: string | null;
  previewImageUrl?: string | null;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPosition = (value: unknown): value is CustomizationPosition =>
  isObject(value) && typeof value.x === "number" && typeof value.y === "number";

const parseStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const entries = value.filter((entry): entry is string => typeof entry === "string");
  return entries.length === value.length ? entries : undefined;
};

const optStr = (v: unknown): string | null | undefined => {
  if (typeof v === "string") return v;
  if (v === null) return null;
  return undefined;
};

export const parsePendingCustomizationData = (
  value: Json | null | undefined,
): PendingCustomizationData => {
  if (!isObject(value)) return {};

  return {
    scale: typeof value.scale === "number" ? value.scale : undefined,
    position: isPosition(value.position) ? value.position : undefined,
    rotation: typeof value.rotation === "number" ? value.rotation : undefined,
    activeFilter: optStr(value.activeFilter),
    filteredImagePath: optStr(value.filteredImagePath),
    previewImagePath: optStr(value.previewImagePath),
    filterHistory: parseStringArray(value.filterHistory),
  };
};

export const parseOrderCustomizationData = (
  value: Json | null | undefined,
): OrderCustomizationData => {
  if (!isObject(value)) return {};

  const parseImageUrlField = (
    camelKey: string,
    snakeKey: string,
  ): string | null | undefined => {
    const r = optStr(value[camelKey]);
    if (r !== undefined) return r;
    return optStr(value[snakeKey]);
  };

  return {
    rawImage: optStr(value.rawImage),
    image: optStr(value.image),
    editedImage: optStr(value.editedImage),
    previewImage: optStr(value.previewImage),
    imageFileName: optStr(value.imageFileName),
    scale: typeof value.scale === "number" ? value.scale : undefined,
    position: isPosition(value.position) ? value.position : undefined,
    rotation: typeof value.rotation === "number" ? value.rotation : undefined,
    activeFilter: optStr(value.activeFilter),
    filteredImagePath: optStr(value.filteredImagePath),
    previewImagePath: optStr(value.previewImagePath),
    filterHistory: parseStringArray(value.filterHistory),
    rawImageUrl: parseImageUrlField("rawImageUrl", "raw_image_url"),
    originalImageUrl: parseImageUrlField("originalImageUrl", "original_image_url"),
    editedImageUrl: parseImageUrlField("editedImageUrl", "edited_image_url"),
    previewImageUrl: parseImageUrlField("previewImageUrl", "preview_image_url"),
  };
};
