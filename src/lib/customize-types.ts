export const PHONE_W = 260;
export const PHONE_H = 532;

export const DEFAULTS = {
  scale: 100,
  position: { x: 50, y: 50 },
  rotation: 0,
};

export interface AiFilter {
  id: string;
  name: string;
  style_image_url: string | null;
  category_id: string | null;
}

export interface AiFilterCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface FilterHistoryEntry {
  filterId: string;
  image: string;
  filterName?: string;
}

