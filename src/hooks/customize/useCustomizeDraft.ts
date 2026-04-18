import { useEffect, useRef, useState } from "react";
import { parsePendingCustomizationData } from "@/types/customization";
import type { PendingCheckoutRow } from "@/hooks/usePendingCheckout";

type Position = { x: number; y: number };

type UseCustomizeDraftParams = {
  productSlug?: string;
  productId?: string;
  userId?: string;
  toast: (payload: { title: string }) => void;
  image: string | null;
  originalImage: string | null;
  scale: number;
  position: Position;
  rotation: number;
  setScale: (value: number) => void;
  setPosition: (value: Position) => void;
  setRotation: (value: number) => void;
  setOriginalImage: (value: string | null) => void;
  setFilteredImage: (value: string | null) => void;
  setActiveFilterId: (value: string | null) => void;
  setImageWithResolution: (src: string) => Promise<void>;
  fetchPending: (productId: string) => Promise<PendingCheckoutRow | null>;
  getSignedUrl: (path: string) => Promise<string | null>;
};

export function useCustomizeDraft(params: UseCustomizeDraftParams) {
  const {
    productSlug,
    productId,
    userId,
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
    setImageWithResolution,
    fetchPending,
    getSignedUrl,
  } = params;

  const [draftSaved, setDraftSaved] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const sessionRestored = useRef(false);
  const pendingRestored = useRef(false);
  const prevSlugRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (productSlug && productSlug !== prevSlugRef.current) {
      if (prevSlugRef.current !== undefined) {
        sessionRestored.current = false;
        pendingRestored.current = false;
        setRestoring(true);
      }
      prevSlugRef.current = productSlug;
    }
  }, [productSlug]);

  useEffect(() => {
    if (!productSlug || sessionRestored.current) return;
    const key = `draft-customize-${productSlug}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    sessionRestored.current = true;

    try {
      const draft = JSON.parse(raw);
      if (draft.image) {
        setOriginalImage(draft.image);
        setImageWithResolution(draft.image);
      }
      if (draft.scale != null) setScale(draft.scale);
      if (draft.position) setPosition(draft.position);
      if (draft.rotation != null) setRotation(draft.rotation);
      // Suppress toast on first visit when intro dialog is showing
      if (typeof window !== "undefined" && localStorage.getItem("customize_intro_seen")) {
        toast({ title: "Rascunho restaurado" });
      }
    } catch {
      // ignore parse failures
    }
  }, [productSlug, userId, setImageWithResolution, setOriginalImage, setScale, setPosition, setRotation, toast]);

  useEffect(() => {
    if (!productSlug || !productId) return;
    if (!userId) {
      // Not logged in — no pending checkout to restore
      if (sessionRestored.current) setRestoring(false);
      return;
    }
    if (pendingRestored.current || sessionRestored.current) {
      setRestoring(false);
      return;
    }
    pendingRestored.current = true;

    (async () => {
      try {
        const pending = await fetchPending(productId);
        if (!pending) return;

        const cd = parsePendingCustomizationData(pending.customization_data);

        if (cd.scale != null) setScale(cd.scale);
        if (cd.position) setPosition(cd.position);
        if (cd.rotation != null) setRotation(cd.rotation);

        const basePath = pending.edited_image_path || pending.original_image_path;
        if (basePath) {
          const baseUrl = await getSignedUrl(basePath);
          if (baseUrl) {
            setOriginalImage(baseUrl);
            await setImageWithResolution(baseUrl);
          }
        }

        if (cd.filteredImagePath && cd.activeFilter) {
          const filteredUrl = await getSignedUrl(cd.filteredImagePath);
          if (filteredUrl) {
            setFilteredImage(filteredUrl);
            setActiveFilterId(cd.activeFilter);
            await setImageWithResolution(filteredUrl);
          }
        }

        toast({ title: "Rascunho recuperado" });
      } catch (error) {
        console.error("Erro ao restaurar checkout pendente", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, [productSlug, productId, userId, fetchPending, getSignedUrl, setScale, setPosition, setRotation, setOriginalImage, setFilteredImage, setActiveFilterId, setImageWithResolution, toast]);

  useEffect(() => {
    if (!productSlug) return;

    const timeout = setTimeout(() => {
      try {
        const payload = { image: originalImage || image, scale, position, rotation };
        sessionStorage.setItem(`draft-customize-${productSlug}`, JSON.stringify(payload));
        setDraftSaved(true);
        const markerTimeout = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(markerTimeout);
      } catch {
        // ignore quota exceeded
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [productSlug, image, originalImage, scale, position, rotation]);

  return { draftSaved, restoring };
}
