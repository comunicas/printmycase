import { useState, useEffect, useCallback, useRef } from "react";
import { clarityEvent } from "@/lib/clarity";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, PHONE_W, PHONE_H, type AiFilter } from "@/lib/customize-types";
import {
  compressImage,
  compressForAI,
  urlToDataUrl,
  renderSnapshot,
  getImageResolution,
} from "@/lib/image-utils";
import { useCoins } from "@/hooks/useCoins";
import { useCoinSettings } from "@/hooks/useCoinSettings";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";
import { ToastAction } from "@/components/ui/toast";

export function useCustomize(productId: string | undefined) {
  const { product, loading: productLoading } = useProduct(productId);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const draftRestored = useRef(false);
  const { upsert: upsertPending, fetchByProduct: fetchPending, getSignedUrl } = usePendingCheckout();

  // --- state ---
  const [image, setImage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [applyingFilterId, setApplyingFilterId] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [imageResolution, setImageResolution] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [rotation, setRotation] = useState(DEFAULTS.rotation);
  const [filters, setFilters] = useState<AiFilter[]>([]);
  const [pendingFilterId, setPendingFilterId] = useState<string | null>(null);
  const [showUpscaleDialog, setShowUpscaleDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);

  const { balance: coinBalance, refresh: refreshCoins } = useCoins();
  const { getSetting } = useCoinSettings();
  const aiFilterCost = getSetting("ai_filter_cost", 10);
  const aiUpscaleCost = getSetting("ai_upscale_cost", 5);

  const isHD = !!(imageResolution && imageResolution.w >= 800 && imageResolution.h >= 1600);

  // Helper: set image and always resolve its dimensions
  const setImageWithResolution = useCallback(async (src: string) => {
    setImage(src);
    try {
      const res = await getImageResolution(src);
      setImageResolution(res);
    } catch { /* ignore */ }
  }, []);

  // --- redirect if product not found ---
  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", description: "Redirecionando ao catálogo.", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  // --- load AI filters ---
  useEffect(() => {
    (supabase as any)
      .from("ai_filters")
      .select("id, name, style_image_url")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: { data: AiFilter[] | null }) => {
        if (data) setFilters(data);
      });
  }, []);

  // --- draft restore ---
  useEffect(() => {
    if (!product?.slug || !product?.id || draftRestored.current) return;
    draftRestored.current = true;
    const key = `draft-customize-${product.slug}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (d.image) {
          setOriginalImage(d.image);
          setImageWithResolution(d.image);
        }
        if (d.scale != null) setScale(d.scale);
        if (d.position) setPosition(d.position);
        if (d.rotation != null) setRotation(d.rotation);
        toast({ title: "Rascunho restaurado" });
      } catch { /* ignore */ }
      return;
    }
    if (!user) return;
    (async () => {
      const pending = await fetchPending(product.id);
      if (!pending) return;
      const cd = pending.customization_data as any;
      if (cd.scale != null) setScale(cd.scale);
      if (cd.position) setPosition(cd.position);
      if (cd.rotation != null) setRotation(cd.rotation);
      const imgPath = pending.edited_image_path || pending.original_image_path;
      if (imgPath) {
        const url = await getSignedUrl(imgPath);
        if (url) {
          setOriginalImage(url);
          setImageWithResolution(url);
        }
      }
      toast({ title: "Rascunho recuperado" });
    })();
  }, [product?.slug, product?.id, user, toast, setImageWithResolution]);

  // --- auto-save draft ---
  useEffect(() => {
    if (!product?.slug) return;
    const timeout = setTimeout(() => {
      const key = `draft-customize-${product.slug}`;
      try {
        sessionStorage.setItem(key, JSON.stringify({ image: originalImage || image, scale, position, rotation }));
      } catch { /* ignore quota */ }
    }, 500);
    return () => clearTimeout(timeout);
  }, [product?.slug, image, originalImage, scale, position, rotation]);

  // --- derived ---
  const isModified = scale !== DEFAULTS.scale ||
    position.x !== DEFAULTS.position.x || position.y !== DEFAULTS.position.y ||
    rotation !== DEFAULTS.rotation;

  const isProcessing = isCompressing || isRendering || !!applyingFilterId || isUpscaling;
  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";

  // --- handlers ---
  const handleReset = useCallback(() => {
    setScale(DEFAULTS.scale);
    setPosition(DEFAULTS.position);
    setRotation(DEFAULTS.rotation);
    if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); }
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug, originalImage]);

  const handleCompareStart = useCallback(() => {
    if (originalImage && activeFilterId) setImage(originalImage);
  }, [originalImage, activeFilterId]);

  const handleCompareEnd = useCallback(() => {
    if (filteredImage && activeFilterId) setImage(filteredImage);
  }, [filteredImage, activeFilterId]);

  const handleRemoveFilter = useCallback(() => {
    if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); }
  }, [originalImage]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleExpand = useCallback(async () => {
    let res = imageResolution;
    if (!res && image) {
      try {
        res = await getImageResolution(image);
        setImageResolution(res);
      } catch { return; }
    }
    if (!res) return;
    const phoneRatio = PHONE_W / PHONE_H;
    const imgRatio = res.w / res.h;
    let newScale = imgRatio > phoneRatio
      ? Math.ceil((imgRatio / phoneRatio) * 100)
      : 100;
    newScale = Math.max(50, Math.min(200, newScale));
    setScale(newScale);
    setPosition({ x: 50, y: 50 });
    setRotation(0);
    toast({ title: "Imagem enquadrada" });
  }, [imageResolution, image, toast]);

  const handleImageUpload = useCallback((file: File) => {
    setImageFileName(file.name);
    setIsCompressing(true);
    setActiveFilterId(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string;
      const res = await getImageResolution(originalDataUrl);
      setImageResolution(res);
      if (res.w < 400 || res.h < 800) {
        toast({
          title: "Qualidade baixa para impressão",
          description: `${res.w}×${res.h}px — use o Upscale IA para melhorar.`,
          variant: "destructive",
          action: <ToastAction altText="Upscale IA" onClick={() => { if (!user) { setShowLoginDialog(true); return; } setShowUpscaleDialog(true); }}>✨ Upscale IA</ToastAction>,
        });
      } else if (res.w < 800 || res.h < 1600) {
        toast({
          title: "Qualidade pode melhorar",
          description: `${res.w}×${res.h}px — use o Upscale IA para qualidade de impressão ideal.`,
          action: <ToastAction altText="Upscale IA" onClick={() => { if (!user) { setShowLoginDialog(true); return; } setShowUpscaleDialog(true); }}>✨ Upscale IA</ToastAction>,
        });
      }
      const { url, compressed } = await compressImage(originalDataUrl);
      setImage(url);
      setRawImage(url);
      setOriginalImage(url);
      setIsCompressing(false);
      if (compressed) toast({ title: "Imagem otimizada automaticamente" });
      clarityEvent("customize_image_uploaded");
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setShowLoginDialog(true);
    return false;
  }, [user]);

  const handleFilterClick = useCallback((filterId: string) => {
    if (!requireAuth()) return;
    if (!image || applyingFilterId) return;
    if (activeFilterId === filterId) {
      if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); }
      return;
    }
    if (imageResolution && (imageResolution.w < 256 || imageResolution.h < 256)) {
      toast({
        title: "Imagem pequena demais para filtros",
        description: "Mín. 256×256px. Use o Upscale IA primeiro para aumentar a resolução.",
        variant: "destructive",
        action: <ToastAction altText="Upscale IA" onClick={() => setShowUpscaleDialog(true)}>✨ Upscale IA</ToastAction>,
      });
      return;
    }
    setPendingFilterId(filterId);
  }, [requireAuth, image, applyingFilterId, activeFilterId, originalImage, imageResolution, toast]);

  const handleFilterConfirm = useCallback(async () => {
    if (!pendingFilterId || !image) return;
    const filterId = pendingFilterId;
    setPendingFilterId(null);
    const sourceImage = originalImage || image;
    setApplyingFilterId(filterId);
    setProcessingMsg("Enviando imagem...");
    try {
      const compressedSource = await compressForAI(sourceImage);
      setProcessingMsg("Aplicando filtro IA...");
      const { data, error } = await supabase.functions.invoke("apply-ai-filter", {
        body: { imageBase64: compressedSource, filterId },
      });
      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        const errorMsg = data?.error || "Tente novamente.";
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro ao aplicar filtro",
          description: isInsufficientCoins ? "Compre mais moedas para usar filtros IA." : errorMsg,
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }
      setProcessingMsg("Finalizando...");
      let resultImage: string;
      if (data.imageUrl) {
        try { resultImage = await urlToDataUrl(data.imageUrl); } catch { resultImage = data.imageUrl; }
      } else {
        resultImage = data.image;
      }
      if (!originalImage) setOriginalImage(image);
      await setImageWithResolution(resultImage);
      setFilteredImage(resultImage);
      setActiveFilterId(filterId);
      clarityEvent("customize_filter_applied");
      refreshCoins();
    } catch {
      toast({ title: "Erro ao aplicar filtro", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
      setProcessingMsg(null);
    }
  }, [pendingFilterId, image, originalImage, navigate, toast, refreshCoins, setImageWithResolution]);

  const handleUpscaleClick = useCallback(() => {
    if (!requireAuth()) return;
    if (!image || isUpscaling || isHD) return;
    setShowUpscaleDialog(true);
  }, [requireAuth, image, isUpscaling, isHD]);

  const handleUpscaleConfirm = useCallback(async () => {
    if (!image) return;
    setShowUpscaleDialog(false);
    setIsUpscaling(true);
    setProcessingMsg("Enviando imagem...");
    try {
      const sourceImage = originalImage || image;
      const compressedSource = await compressForAI(sourceImage);
      setProcessingMsg("Melhorando resolução...");
      const { data, error } = await supabase.functions.invoke("upscale-image", {
        body: { imageBase64: compressedSource },
      });
      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        const errorMsg = data?.error || "Tente novamente.";
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro no upscale",
          description: isInsufficientCoins ? "Compre mais moedas para usar o upscale IA." : errorMsg,
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }
      setProcessingMsg("Finalizando...");
      let resultImage: string;
      if (data.imageUrl) {
        try { resultImage = await urlToDataUrl(data.imageUrl); } catch { resultImage = data.imageUrl; }
      } else {
        resultImage = data.image;
      }
      setOriginalImage(resultImage);
      await setImageWithResolution(resultImage);
      if (data.width && data.height) setImageResolution({ w: data.width, h: data.height });
      setActiveFilterId(null);
      refreshCoins();
      toast({ title: "Upscale concluído!", description: `Nova resolução: ${data.width}×${data.height}px` });
    } catch {
      toast({ title: "Erro no upscale", variant: "destructive" });
    } finally {
      setIsUpscaling(false);
      setProcessingMsg(null);
    }
  }, [image, originalImage, navigate, toast, refreshCoins, setImageWithResolution]);

  const handleContinue = useCallback(async () => {
    if (!requireAuth()) return;
    if (!product || !image) return;
    setIsRendering(true);
    try {
      const finalImage = await renderSnapshot(image, scale, position, rotation);
      const customData = { rawImage, image, editedImage: finalImage, imageFileName, scale, position, rotation };
      try {
        sessionStorage.setItem("customization", JSON.stringify(customData));
      } catch {
        try {
          sessionStorage.setItem("customization", JSON.stringify({ ...customData, rawImage: null, image: null }));
        } catch {
          toast({ title: "Erro ao salvar customização", variant: "destructive" });
          return;
        }
      }
      if (user) {
        try {
          const ts = Date.now();
          let rawPath: string | null = null;
          let optimizedPath: string | null = null;
          let finalPath: string | null = null;

          // 1. Raw image (original upload, never changes)
          const rawSrc = rawImage || originalImage || image;
          if (rawSrc) {
            const blob = await fetch(rawSrc).then(r => r.blob());
            const ext = imageFileName?.split(".").pop() || "png";
            const path = `${user.id}/pending_raw_${ts}.${ext}`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            rawPath = path;
          }

          // 2. Optimized image (after filters/upscale, max quality)
          const optimSrc = originalImage || image;
          if (optimSrc) {
            const blob = await fetch(optimSrc).then(r => r.blob());
            const path = `${user.id}/pending_optim_${ts}.jpg`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            optimizedPath = path;
          }

          // 3. Final image (snapshot with frame positioning)
          if (finalImage) {
            const blob = await fetch(finalImage).then(r => r.blob());
            const path = `${user.id}/pending_final_${ts}.jpg`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            finalPath = path;
          }

          await upsertPending(
            product.id,
            { scale, position, rotation, activeFilter: activeFilterId },
            optimizedPath,
            finalPath,
            rawPath,
          );
        } catch { /* silently ignore */ }
      }
      if (product.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
      navigate(`/checkout/${product.slug}`);
    } finally {
      setIsRendering(false);
    }
  }, [requireAuth, product, image, rawImage, originalImage, imageFileName, scale, position, rotation, activeFilterId, user, navigate, toast, upsertPending]);

  return {
    // product
    product, productLoading, productName,
    // image state
    image, imageResolution, isHD,
    // transform state
    scale, position, rotation, setScale, setPosition,
    // filter state
    filters, activeFilterId, applyingFilterId, pendingFilterId, filteredImage,
    // dialog state
    showUpscaleDialog, setShowUpscaleDialog, setPendingFilterId,
    showLoginDialog, setShowLoginDialog,
    // costs
    coinBalance, aiFilterCost, aiUpscaleCost,
    // flags
    isModified, isProcessing, isCompressing, isRendering, isUpscaling,
    processingMsg,
    // handlers
    handleReset, handleRotate, handleExpand, handleImageUpload,
    handleFilterClick, handleFilterConfirm, handleRemoveFilter,
    handleCompareStart, handleCompareEnd,
    handleUpscaleClick, handleUpscaleConfirm,
    handleContinue,
  };
}
