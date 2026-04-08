import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useCustomizeFilters } from "./useCustomizeFilters";

vi.mock("@/services/customize/filters", () => ({
  fetchActiveAiFilters: vi.fn().mockResolvedValue([{ id: "f1", name: "Filtro 1", style_image_url: null, category_id: null }]),
  fetchActiveAiFilterCategories: vi.fn().mockResolvedValue([{ id: "c1", name: "Base", sort_order: 1 }]),
}));

vi.mock("@/lib/image-utils", () => ({
  uploadForAI: vi.fn().mockResolvedValue({ signedUrl: "https://signed.example" }),
}));

vi.mock("@/services/customize/ai", () => ({
  invokeApplyAiFilter: vi.fn().mockResolvedValue({ data: { imageUrl: "https://result.example" }, error: null }),
  invokeUpscaleImage: vi.fn().mockResolvedValue({ data: { imageUrl: "https://upscaled.example" }, error: null }),
}));

describe("useCustomizeFilters", () => {
  beforeEach(() => vi.clearAllMocks());

  it("desfaz último filtro quando clica no filtro ativo", async () => {
    const toast = vi.fn();
    const requireAuth = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => {
      const [image, setImage] = useState<string | null>("img-2");
      const [originalImage, setOriginalImage] = useState<string | null>("img-0");
      const [filteredImage, setFilteredImage] = useState<string | null>("img-2");
      const [activeFilterId, setActiveFilterId] = useState<string | null>("f2");
      const [filterHistory, setFilterHistory] = useState([
        { filterId: "f1", image: "img-1" },
        { filterId: "f2", image: "img-2" },
      ]);

      const hook = useCustomizeFilters({
        userId: "u1",
        navigate: vi.fn(),
        toast,
        image,
        originalImage,
        imageResolution: { w: 1000, h: 2000 },
        isHD: true,
        filterHistory,
        activeFilterId,
        coinBalance: 100,
        aiFilterCost: 10,
        aiUpscaleCost: 5,
        sessionId: "s1",
        refreshCoins: vi.fn().mockResolvedValue(undefined),
        setImageWithResolution: async (src) => setImage(src),
        setImage,
        setOriginalImage,
        setFilteredImage,
        setActiveFilterId,
        setFilterHistory,
        requireAuth,
      });

      return { hook, state: { image, filteredImage, activeFilterId, filterHistory } };
    });

    act(() => {
      result.current.hook.handleFilterClick("f2");
    });

    await waitFor(() => {
      expect(result.current.state.filterHistory).toHaveLength(1);
      expect(result.current.state.activeFilterId).toBe("f1");
      expect(result.current.state.image).toBe("img-1");
      expect(result.current.state.filteredImage).toBe("img-1");
    });
  });

  it("define pendingFilterId no fluxo normal", () => {
    const { result } = renderHook(() => {
      const [image, setImage] = useState<string | null>("img");
      const [originalImage, setOriginalImage] = useState<string | null>("img");
      const [filteredImage, setFilteredImage] = useState<string | null>(null);
      const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
      const [filterHistory, setFilterHistory] = useState<any[]>([]);

      return useCustomizeFilters({
        userId: "u1",
        navigate: vi.fn(),
        toast: vi.fn(),
        image,
        originalImage,
        imageResolution: { w: 1000, h: 2000 },
        isHD: false,
        filterHistory,
        activeFilterId,
        coinBalance: 100,
        aiFilterCost: 10,
        aiUpscaleCost: 5,
        sessionId: "s1",
        refreshCoins: vi.fn().mockResolvedValue(undefined),
        setImageWithResolution: async (src) => setImage(src),
        setImage,
        setOriginalImage,
        setFilteredImage,
        setActiveFilterId,
        setFilterHistory,
        requireAuth: vi.fn().mockReturnValue(true),
      });
    });

    act(() => {
      result.current.handleFilterClick("f1");
    });

    expect(result.current.pendingFilterId).toBe("f1");
  });
});
