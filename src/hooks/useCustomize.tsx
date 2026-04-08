import { useState, useEffect, useCallback, useRef } from "react";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent, generateEventId } from "@/lib/meta-pixel";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadCustomizationAsset } from "@/lib/customization-upload";
import { DEFAULTS, PHONE_W, PHONE_H, type AiFilter, type AiFilterCategory, type FilterHistoryEntry } from "@/lib/customize-types";
import {
  compressImage,
  renderSnapshot,
  renderPhoneMockup,
  getImageResolution,
  uploadForAI,
} from "@/lib/image-utils";
import { useCoins } from "@/hooks/useCoins";
import { useCoinSettings } from "@/hooks/useCoinSettings";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";
import { ToastAction } from "@/components/ui/toast";
import { parsePendingCustomizationData, type PendingCustomizationData } from "@/types/customization";

export function useCustomize(productId: string | undefined) {
  const { product, loading: productLoading } = useProduct(productId);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { upsert: upsertPending, fetchByProduct: fetchPending, getSignedUrl } = usePendingCheckout();

  // --- state ---
  const [draftSaved, setDraftSaved] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  // rawImage: stores the unmodified upload data URL; used only for storage upload (pending_raw path)
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [filterHistory, setFilterHistory] = useState<FilterHistoryEntry[]>([]);
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
  const [loginReason, setLoginReason] = useState<"filter" | "upscale" | null>(null);
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
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar filtros de IA", error);
          return;
        }
        setFilters((data ?? []) as AiFilter[]);
      });
    supabase
      .from("ai_filter_categories")
      .select("id, name, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar categorias de filtro", error);
          return;
        }
        setFilterCategories((data ?? []) as AiFilterCategory[]);
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
      try {
        const pending = await fetchPending(product.id);
        if (!pending) return;

        const cd: PendingCustomizationData = parsePendingCustomizationData(pending.customization_data);

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
      } catch (error) {
        console.error("Erro ao restaurar checkout pendente", error);
      }
    })();
  }, [product?.slug, product?.id, user, toast, setImageWithResolution, fetchPending, getSignedUrl]);

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
    if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); setFilterHistory([]); }
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug, originalImage]);

  const handleCompareStart = useCallback(() => {
    if (originalImage && (activeFilterId || filterHistory.length > 0)) setImage(originalImage);
  }, [originalImage, activeFilterId, filterHistory]);

  const handleCompareEnd = useCallback(() => {
    if (filteredImage && (activeFilterId || filterHistory.length > 0)) setImage(filteredImage);
  }, [filteredImage, activeFilterId, filterHistory]);

  const handleRemoveFilter = useCallback(() => {
    if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); setFilterHistory([]); }
  }, [originalImage]);

  const handleUndoLastFilter = useCallback(() => {
    if (filterHistory.length <= 1) {
      // Only one or zero entries — remove all
      if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); setFilterHistory([]); }
      return;
    }
    // Pop last entry, revert to previous
    const newHistory = filterHistory.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    setFilterHistory(newHistory);
    setImage(prev.image);
    setFilteredImage(prev.image);
    setActiveFilterId(prev.filterId);
  }, [filterHistory, originalImage]);

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
          action: <ToastAction altText="Upscale IA" onClick={() => { if (!user) { setLoginReason("upscale"); setShowLoginDialog(true); return; } setShowUpscaleDialog(true); }}>✨ Upscale IA</ToastAction>,
        });
      } else if (res.w < 800 || res.h < 1600) {
        toast({
          title: "Qualidade pode melhorar",
          description: `${res.w}×${res.h}px — use o Upscale IA para qualidade de impressão ideal.`,
          action: <ToastAction altText="Upscale IA" onClick={() => { if (!user) { setLoginReason("upscale"); setShowLoginDialog(true); return; } setShowUpscaleDialog(true); }}>✨ Upscale IA</ToastAction>,
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

  const requireAuth = useCallback((reason?: "filter" | "upscale") => {
    if (user) return true;
    setLoginReason(reason ?? null);
    setShowLoginDialog(true);
    return false;
  }, [user]);

  const handleFilterClick = useCallback((filterId: string) => {
    if (!requireAuth("filter")) return;
    if (!image || applyingFilterId) return;
    // Clicking the last applied filter => undo it
    if (activeFilterId === filterId && filterHistory.length > 0) {
      handleUndoLastFilter();
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
  }, [requireAuth, image, applyingFilterId, activeFilterId, filterHistory, handleUndoLastFilter, imageResolution, toast]);

  const handleFilterConfirm = useCallback(async () => {
    if (!pendingFilterId || !image || !user) return;
    const filterId = pendingFilterId;
    setPendingFilterId(null);
    // Use current displayed image (which may already be filtered) as source
    const sourceImage = image;
    setApplyingFilterId(filterId);
    setProcessingMsg("Enviando imagem...");
    try {
      const { signedUrl } = await uploadForAI(sourceImage, user.id, supabase);
      setProcessingMsg("Aplicando filtro IA...");
      const stepNumber = filterHistory.length + 1;
      const { data, error } = await supabase.functions.invoke("apply-ai-filter", {
        body: { imageUrl: signedUrl, filterId, step_number: stepNumber, session_id: sessionId },
      });
      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro ao aplicar filtro",
          description: isInsufficientCoins ? "Compre mais moedas para usar filtros IA." : "Nenhuma moeda foi debitada. Tente gerar novamente.",
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }
      setProcessingMsg("Finalizando...");
      const resultImage = data.imageUrl || data.image;
      if (!originalImage) setOriginalImage(image);
      await setImageWithResolution(resultImage);
      setFilteredImage(resultImage);
      setActiveFilterId(filterId);
      // Add to history
      const filterObj = filters.find(f => f.id === filterId);
      setFilterHistory(prev => [...prev, { filterId, image: resultImage, filterName: filterObj?.name }]);
      clarityEvent("customize_filter_applied");
      await refreshCoins();
      const newBalance = coinBalance - aiFilterCost;
      if (newBalance < Math.min(aiFilterCost, aiUpscaleCost)) {
        toast({
          title: "Suas moedas estão acabando! 🪙",
          description: "Compre mais ou indique amigos para ganhar moedas grátis.",
          action: <ToastAction altText="Comprar moedas" onClick={() => navigate("/coins")}>Comprar moedas</ToastAction>,
        });
      }
    } catch {
      toast({ title: "Erro ao aplicar filtro", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
      setProcessingMsg(null);
    }
  }, [pendingFilterId, image, originalImage, user, navigate, toast, refreshCoins, setImageWithResolution, coinBalance, aiFilterCost, aiUpscaleCost, filters, filterHistory, sessionId]);

  const handleUpscaleClick = useCallback(() => {
    if (!requireAuth("upscale")) return;
    if (!image || isUpscaling || isHD) return;
    setShowUpscaleDialog(true);
  }, [requireAuth, image, isUpscaling, isHD]);

  const handleUpscaleConfirm = useCallback(async () => {
    if (!image || !user) return;
    setShowUpscaleDialog(false);
    setIsUpscaling(true);
    setProcessingMsg("Enviando imagem...");
    try {
      const sourceImage = originalImage || image;
      const { signedUrl } = await uploadForAI(sourceImage, user.id, supabase);
      setProcessingMsg("Melhorando resolução...");
      const stepNumber = filterHistory.length + 1;
      const { data, error } = await supabase.functions.invoke("upscale-image", {
        body: { imageUrl: signedUrl, step_number: stepNumber, session_id: sessionId },
      });
      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro no upscale",
          description: isInsufficientCoins ? "Compre mais moedas para usar o upscale IA." : "Nenhuma moeda foi debitada. Tente gerar novamente.",
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }
      setProcessingMsg("Finalizando...");
      const resultImage = data.imageUrl || data.image;
      setOriginalImage(resultImage);
      await setImageWithResolution(resultImage);
      if (data.width && data.height) setImageResolution({ w: data.width, h: data.height });
      setActiveFilterId(null);
      refreshCoins();
      toast({ title: "Upscale concluído!", description: `Nova resolução: ${data.width}×${data.height}px` });
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
      toast({ title: "Erro no upscale", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" });
    } finally {
      setIsUpscaling(false);
      setProcessingMsg(null);
    }
  }, [image, originalImage, user, navigate, toast, refreshCoins, setImageWithResolution, coinBalance, aiFilterCost, aiUpscaleCost, filterHistory, sessionId]);

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
      toast({ title: "Imagem baixada", description: "A imagem foi salva com sucesso." });
    } catch {
      window.open(src, "_blank");
    }
  }, [filteredImage, image, productName, toast]);

  const handleGalleryImageSelect = useCallback(async (url: string) => {
    setActiveFilterId(null);
    setFilteredImage(null);
    setFilterHistory([]);
    setImageFileName(null);
    setRawImage(null);
    await setImageWithResolution(url);
    setOriginalImage(url);
    clarityEvent("customize_gallery_image_selected");
    toast({ title: "Imagem da galeria aplicada" });
  }, [setImageWithResolution, toast]);

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

      // Generate "Imagem Posição" — canvas-based phone mockup with rounded frame
      let previewImage: string | null = null;
      try {
        previewImage = await renderPhoneMockup(image, scale, position, rotation);
      } catch { /* ignore */ }

      const customData = { rawImage, image, editedImage: finalImage, previewImage, imageFileName, scale, position, rotation };
      try {
        sessionStorage.setItem("customization", JSON.stringify(customData));
      } catch {
        try {
          sessionStorage.setItem("customization", JSON.stringify({ ...customData, rawImage: null, image: null, previewImage: null }));
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
          let previewPath: string | null = null;

          // 1. Raw image (original upload, never changes)
          const rawSrc = rawImage || originalImage || image;
          rawPath = await uploadCustomizationAsset({
            sourceUrl: rawSrc,
            userId: user.id,
            fileName: `pending_raw_${ts}.${imageFileName?.split(".").pop() || "png"}`,
            errorMessage: "Falha ao enviar imagem original pendente.",
            upsert: true,
          });

          // 2. Optimized image (after filters/upscale, max quality)
          const optimSrc = originalImage || image;
          optimizedPath = await uploadCustomizationAsset({
            sourceUrl: optimSrc,
            userId: user.id,
            fileName: `pending_optim_${ts}.jpg`,
            errorMessage: "Falha ao enviar imagem otimizada pendente.",
            upsert: true,
          });

          // 3. Final image (snapshot with frame positioning)
          finalPath = await uploadCustomizationAsset({
            sourceUrl: finalImage,
            userId: user.id,
            fileName: `pending_final_${ts}.jpg`,
            errorMessage: "Falha ao enviar imagem final pendente.",
            upsert: true,
          });

          // 4. Filtered image (AI-generated result)
          filteredPath = await uploadCustomizationAsset({
            sourceUrl: filteredImage,
            userId: user.id,
            fileName: `pending_filtered_${ts}.jpg`,
            errorMessage: "Falha ao enviar imagem filtrada pendente.",
            upsert: true,
          });

          // 5. Preview image (mockup with device frame)
          previewPath = await uploadCustomizationAsset({
            sourceUrl: previewImage,
            userId: user.id,
            fileName: `pending_preview_${ts}.png`,
            errorMessage: "Falha ao enviar imagem de preview pendente.",
            upsert: true,
          });

          const pendingData: PendingCustomizationData = {
            scale,
            position,
            rotation,
            activeFilter: activeFilterId,
            filteredImagePath: filteredPath,
            previewImagePath: previewPath,
            filterHistory: filterHistory.map((h) => h.filterId),
          };

          await upsertPending(
            product.id,
            pendingData,
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
    filters, filterCategories, activeFilterId, applyingFilterId, pendingFilterId, filteredImage, filterHistory,
    // dialog state
    showUpscaleDialog, setShowUpscaleDialog, setPendingFilterId,
    showLoginDialog, setShowLoginDialog, loginReason,
    showTermsDialog, setShowTermsDialog, handleTermsAccept,
    // costs
    coinBalance, aiFilterCost, aiUpscaleCost,
    // flags
    isModified, isProcessing, isCompressing, isRendering, isUpscaling,
    processingMsg,
    // handlers
    handleReset, handleRotate, handleExpand, handleImageUpload,
    handleFilterClick, handleFilterConfirm, handleRemoveFilter, handleUndoLastFilter,
    handleCompareStart, handleCompareEnd,
    handleUpscaleClick, handleUpscaleConfirm,
    handleContinue, handleDownload, handleGalleryImageSelect,
  };
}
