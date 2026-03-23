import { useState, useEffect, useCallback, useRef } from "react";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent, generateEventId } from "@/lib/meta-pixel";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, PHONE_W, PHONE_H, type AiFilter, type AiFilterCategory } from "@/lib/customize-types";
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
  
  const { upsert: upsertPending, fetchByProduct: fetchPending, getSignedUrl } = usePendingCheckout();

  // --- state ---
  const [draftSaved, setDraftSaved] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  // rawImage: stores the unmodified upload data URL; used only for storage upload (pending_raw path)
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
  const [filterCategories, setFilterCategories] = useState<AiFilterCategory[]>([]);
  const [pendingFilterId, setPendingFilterId] = useState<string | null>(null);
  const [showUpscaleDialog, setShowUpscaleDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);
  const termsAccepted = useRef(false);

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
      toast({ title: "Produto não encontrado", description: "Selecione um modelo para continuar.", variant: "destructive" });
      navigate("/customize", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  // --- load AI filters + categories ---
  useEffect(() => {
    supabase
      .from("ai_filters")
      .select("id, name, style_image_url, category_id")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setFilters(data as AiFilter[]);
      });
    supabase
      .from("ai_filter_categories")
      .select("id, name, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setFilterCategories(data as AiFilterCategory[]);
      });
  }, []);

  // --- draft restore ---
  // Track which sources have been restored to avoid duplicates
  const sessionRestored = useRef(false);
  const pendingRestored = useRef(false);
  const prevSlugRef = useRef<string | undefined>(undefined);

  // Reset restore refs when product slug changes
  useEffect(() => {
    if (product?.slug && product.slug !== prevSlugRef.current) {
      if (prevSlugRef.current !== undefined) {
        sessionRestored.current = false;
        pendingRestored.current = false;
      }
      prevSlugRef.current = product.slug;
    }
  }, [product?.slug]);

  // Restore from sessionStorage (runs on mount and when user changes after OAuth/signup)
  useEffect(() => {
    if (!product?.slug || sessionRestored.current) return;
    const key = `draft-customize-${product.slug}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    sessionRestored.current = true;
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
  }, [product?.slug, user, toast, setImageWithResolution]);

  // Restore from pending_checkouts (server-side, only if no sessionStorage draft)
  useEffect(() => {
    if (!product?.slug || !product?.id || !user || pendingRestored.current || sessionRestored.current) return;
    pendingRestored.current = true;
    (async () => {
      const pending = await fetchPending(product.id);
      if (!pending) return;
      const cd = pending.customization_data as any;
      if (cd.scale != null) setScale(cd.scale);
      if (cd.position) setPosition(cd.position);
      if (cd.rotation != null) setRotation(cd.rotation);
      // Restore original image
      const imgPath = pending.edited_image_path || pending.original_image_path;
      if (imgPath) {
        const url = await getSignedUrl(imgPath);
        if (url) {
          setOriginalImage(url);
          setImageWithResolution(url);
        }
      }
      // Restore filtered image if available
      if (cd.filteredImagePath && cd.activeFilter) {
        const filteredUrl = await getSignedUrl(cd.filteredImagePath);
        if (filteredUrl) {
          setFilteredImage(filteredUrl);
          setActiveFilterId(cd.activeFilter);
          setImageWithResolution(filteredUrl);
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
        setDraftSaved(true);
        const t = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(t);
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

  const processImageFile = useCallback((file: File) => {
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

  const handleImageUpload = useCallback((file: File) => {
    if (termsAccepted.current) {
      processImageFile(file);
    } else {
      setPendingFile(file);
      setShowTermsDialog(true);
    }
  }, [processImageFile]);

  const handleTermsAccept = useCallback(() => {
    termsAccepted.current = true;
    setShowTermsDialog(false);
    if (pendingFile) {
      processImageFile(pendingFile);
      setPendingFile(null);
    }
  }, [pendingFile, processImageFile]);

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
      await refreshCoins();
      // Check low balance
      const newBalance = coinBalance - aiFilterCost;
      if (newBalance < Math.min(aiFilterCost, aiUpscaleCost)) {
        toast({
          title: "Suas moedas estão acabando! 🪙",
          description: "Compre mais ou indique amigos para ganhar moedas grátis.",
          action: <ToastAction altText="Comprar moedas" onClick={() => navigate("/coins")}>Comprar moedas</ToastAction>,
        });
      }
    } catch {
      toast({ title: "Erro ao aplicar filtro", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
      setProcessingMsg(null);
    }
  }, [pendingFilterId, image, originalImage, navigate, toast, refreshCoins, setImageWithResolution, coinBalance, aiFilterCost, aiUpscaleCost]);

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
      // Check low balance
      const newBalance = coinBalance - aiUpscaleCost;
      if (newBalance < Math.min(aiFilterCost, aiUpscaleCost)) {
        setTimeout(() => {
          toast({
            title: "Suas moedas estão acabando! 🪙",
            description: "Compre mais ou indique amigos para ganhar moedas grátis.",
            action: <ToastAction altText="Comprar moedas" onClick={() => navigate("/coins")}>Comprar moedas</ToastAction>,
          });
        }, 3000);
      }
    } catch {
      toast({ title: "Erro no upscale", variant: "destructive" });
    } finally {
      setIsUpscaling(false);
      setProcessingMsg(null);
    }
  }, [image, originalImage, navigate, toast, refreshCoins, setImageWithResolution, coinBalance, aiFilterCost, aiUpscaleCost]);

  const handleDownload = useCallback(async () => {
    const src = filteredImage || image;
    if (!src) return;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `printmycase-${productName.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(src, "_blank");
    }
  }, [filteredImage, image, productName]);

  const handleContinue = useCallback(async () => {
    if (!requireAuth()) return;
    if (!product || !image) return;
    setIsRendering(true);
    const addToCartEventId = generateEventId();
    pixelEvent("AddToCart", { content_name: product.name, content_ids: [product.id], content_type: "product", value: product.price_cents / 100, currency: "BRL" }, addToCartEventId);

    // Fire server-side CAPI AddToCart (fire-and-forget)
    supabase.functions.invoke("meta-capi", {
      body: {
        event_name: "AddToCart",
        event_id: addToCartEventId,
        event_source_url: window.location.href,
        user_data: { client_user_agent: navigator.userAgent },
        custom_data: { content_ids: [product.id], content_type: "product", value: product.price_cents / 100, currency: "BRL" },
      },
    }).catch(() => {});

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
          let filteredPath: string | null = null;

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

          // 4. Filtered image (AI-generated result)
          if (filteredImage) {
            const blob = await fetch(filteredImage).then(r => r.blob());
            const path = `${user.id}/pending_filtered_${ts}.jpg`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            filteredPath = path;
          }

          await upsertPending(
            product.id,
            { scale, position, rotation, activeFilter: activeFilterId, filteredImagePath: filteredPath },
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
  }, [requireAuth, product, image, rawImage, originalImage, filteredImage, imageFileName, scale, position, rotation, activeFilterId, user, navigate, toast, upsertPending]);

  return {
    // product
    product, productLoading, productName, draftSaved,
    // image state
    image, imageResolution, isHD,
    // transform state
    scale, position, rotation, setScale, setPosition,
    // filter state
    filters, filterCategories, activeFilterId, applyingFilterId, pendingFilterId, filteredImage,
    // dialog state
    showUpscaleDialog, setShowUpscaleDialog, setPendingFilterId,
    showLoginDialog, setShowLoginDialog,
    showTermsDialog, setShowTermsDialog, handleTermsAccept,
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
    handleContinue, handleDownload,
  };
}
