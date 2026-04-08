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

export const parsePendingCustomizationData = (
  value: Json | null | undefined,
): PendingCustomizationData => {
  if (!isObject(value)) return {};

  return {
    scale: typeof value.scale === "number" ? value.scale : undefined,
    position: isPosition(value.position) ? value.position : undefined,
    rotation: typeof value.rotation === "number" ? value.rotation : undefined,
    activeFilter:
      typeof value.activeFilter === "string" || value.activeFilter === null
        ? value.activeFilter
        : undefined,
    filteredImagePath:
      typeof value.filteredImagePath === "string" || value.filteredImagePath === null
        ? value.filteredImagePath
        : undefined,
    previewImagePath:
      typeof value.previewImagePath === "string" || value.previewImagePath === null
        ? value.previewImagePath
        : undefined,
    filterHistory: parseStringArray(value.filterHistory),
  };
};

export const parseOrderCustomizationData = (
  value: Json | null | undefined,
): OrderCustomizationData => {
  if (!isObject(value)) return {};

  const parseImageUrlField = (
    camelKey: "rawImageUrl" | "originalImageUrl" | "editedImageUrl" | "previewImageUrl",
    snakeKey: "raw_image_url" | "original_image_url" | "edited_image_url" | "preview_image_url",
  ): string | null | undefined => {
    const camelValue = value[camelKey];
    if (typeof camelValue === "string" || camelValue === null) return camelValue;
    const snakeValue = value[snakeKey];
    if (typeof snakeValue === "string" || snakeValue === null) return snakeValue;
    return undefined;
  };

  return {
    rawImage: typeof value.rawImage === "string" || value.rawImage === null ? value.rawImage : undefined,
    image: typeof value.image === "string" || value.image === null ? value.image : undefined,
    editedImage: typeof value.editedImage === "string" || value.editedImage === null ? value.editedImage : undefined,
    previewImage:
      typeof value.previewImage === "string" || value.previewImage === null ? value.previewImage : undefined,
    imageFileName:
      typeof value.imageFileName === "string" || value.imageFileName === null ? value.imageFileName : undefined,
    scale: typeof value.scale === "number" ? value.scale : undefined,
    position: isPosition(value.position) ? value.position : undefined,
    rotation: typeof value.rotation === "number" ? value.rotation : undefined,
    activeFilter:
      typeof value.activeFilter === "string" || value.activeFilter === null
        ? value.activeFilter
        : undefined,
    filteredImagePath:
      typeof value.filteredImagePath === "string" || value.filteredImagePath === null
        ? value.filteredImagePath
        : undefined,
    previewImagePath:
      typeof value.previewImagePath === "string" || value.previewImagePath === null
        ? value.previewImagePath
        : undefined,
    filterHistory: parseStringArray(value.filterHistory),
    rawImageUrl: parseImageUrlField("rawImageUrl", "raw_image_url"),
    originalImageUrl: parseImageUrlField("originalImageUrl", "original_image_url"),
    editedImageUrl: parseImageUrlField("editedImageUrl", "edited_image_url"),
    previewImageUrl: parseImageUrlField("previewImageUrl", "preview_image_url"),
  };
};
