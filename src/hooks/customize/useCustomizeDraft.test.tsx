import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useCustomizeDraft } from "./useCustomizeDraft";

function setupDraftHook(options?: { sessionDraft?: Record<string, unknown>; pending?: any }) {
  const toast = vi.fn();
  const fetchPending = vi.fn().mockResolvedValue(options?.pending ?? null);
  const getSignedUrl = vi.fn().mockImplementation(async (path: string) => `signed:${path}`);

  if (options?.sessionDraft) {
    sessionStorage.setItem("draft-customize-iphone-15", JSON.stringify(options.sessionDraft));
  }

  const wrapper = () => {
    const [image] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [scale, setScale] = useState(100);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [rotation, setRotation] = useState(0);
    const [filteredImage, setFilteredImage] = useState<string | null>(null);
    const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

    const hook = useCustomizeDraft({
      productSlug: "iphone-15",
      productId: "product-1",
      userId: "user-1",
      toast,
      image,
      originalImage,
      scale,
      position,
      rotation,
      setScale,
      setPosition,
      setRotation,
      setOriginalImage,
      setFilteredImage,
      setActiveFilterId,
      setImageWithResolution: async (src: string) => setOriginalImage(src),
      fetchPending,
      getSignedUrl,
    });

    return { hook, state: { originalImage, scale, position, rotation, filteredImage, activeFilterId } };
  };

  return { wrapper, toast, fetchPending, getSignedUrl };
}

describe("useCustomizeDraft", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("restaura rascunho do sessionStorage com prioridade", async () => {
    const { wrapper, toast, fetchPending } = setupDraftHook({
      sessionDraft: { image: "img:data", scale: 130, position: { x: 40, y: 60 }, rotation: 90 },
      pending: { customization_data: { scale: 70 }, edited_image_path: "edited.jpg", original_image_path: null },
    });

    const { result } = renderHook(() => wrapper());

    await waitFor(() => {
      expect(result.current.state.originalImage).toBe("img:data");
      expect(result.current.state.scale).toBe(130);
      expect(result.current.state.position).toEqual({ x: 40, y: 60 });
      expect(result.current.state.rotation).toBe(90);
    });

    expect(toast).toHaveBeenCalledWith({ title: "✅ Rascunho restaurado" });
    expect(fetchPending).not.toHaveBeenCalled();
  });

  it("salva automaticamente no sessionStorage", async () => {
    const { wrapper } = setupDraftHook();
    renderHook(() => wrapper());

    await waitFor(() => {
      const saved = JSON.parse(sessionStorage.getItem("draft-customize-iphone-15") || "{}");
      expect(saved.scale).toBe(100);
      expect(saved.position).toEqual({ x: 50, y: 50 });
      expect(saved.rotation).toBe(0);
    });
  });
});
