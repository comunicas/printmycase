import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULTS, PHONE_W, PHONE_H, type FilterHistoryEntry } from "@/lib/customize-types";
import { compressImage, getImageResolution } from "@/lib/image-utils";
import { useCoins } from "@/hooks/useCoins";
import { useCoinSettings } from "@/hooks/useCoinSettings";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";
import { ToastAction } from "@/components/ui/toast";
import { useCustomizeDraft } from "@/hooks/customize/useCustomizeDraft";
import { useCustomizeFilters } from "@/hooks/customize/useCustomizeFilters";
import { useCustomizeRender } from "@/hooks/customize/useCustomizeRender";
import { useCustomizeTracking } from "@/hooks/customize/useCustomizeTracking";

type UploadState = "idle" | "preparing" | "optimizing" | "ready";

export function useCustomize(productId: string | undefined) {
  const { product, loading: productLoading } = useProduct(productId);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { upsert: upsertPending, fetchByProduct: fetchPending, getSignedUrl } = usePendingCheckout();

  const [image, setImage] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [filterHistory, setFilterHistory] = useState<FilterHistoryEntry[]>([]);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [imageResolution, setImageResolution] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [rotation, setRotation] = useState(DEFAULTS.rotation);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginReason, setLoginReason] = useState<"filter" | "upscale" | "checkout" | null>(null);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const termsAccepted = useRef(false);

  const { balance: coinBalance, refresh: refreshCoins } = useCoins();
  const { getSetting } = useCoinSettings();
  const aiFilterCost = getSetting("ai_filter_cost", 10);
  const aiUpscaleCost = getSetting("ai_upscale_cost", 5);

  const { trackImageUploaded, trackFilterApplied, trackGalleryImageSelected, trackAddToCart } = useCustomizeTracking();

  const isHD = !!(imageResolution && imageResolution.w >= 800 && imageResolution.h >= 1600);

  const setImageWithResolution = useCallback(async (src: string) => {
    setImage(src);
    try {
      const res = await getImageResolution(src);
      setImageResolution(res);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", description: "Selecione um modelo para continuar.", variant: "destructive" });
      navigate("/customize", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const { draftSaved, restoring } = useCustomizeDraft({
    productSlug: product?.slug,
    productId: product?.id,
    userId: user?.id,
    toast: ({ title }) => toast({ title }),
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
  });

  const requireAuth = useCallback((reason?: "filter" | "upscale") => {
    if (user) return true;
    setLoginReason(reason ?? null);
    setShowLoginDialog(true);
    return false;
  }, [user]);

  const filterFlow = useCustomizeFilters({
    userId: user?.id,
    navigate,
    toast,
    image,
    originalImage,
    imageResolution,
    isHD,
    filterHistory,
    activeFilterId,
    coinBalance,
    aiFilterCost,
    aiUpscaleCost,
    sessionId,
    refreshCoins,
    setImageWithResolution,
    setImage,
    setOriginalImage,
    setFilteredImage,
    setActiveFilterId,
    setFilterHistory,
    requireAuth: (reason) => requireAuth(reason),
  });

  const renderFlow = useCustomizeRender({
    requireAuth: () => requireAuth(),
    navigate,
    toast,
    trackAddToCart,
    upsertPending,
  });

  const isModified =
    scale !== DEFAULTS.scale ||
    position.x !== DEFAULTS.position.x ||
    position.y !== DEFAULTS.position.y ||
    rotation !== DEFAULTS.rotation;

  const isProcessing = isCompressing || renderFlow.isRendering || !!filterFlow.applyingFilterId || filterFlow.isUpscaling;
  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";
  const uploadReadyTimeoutRef = useRef<number | null>(null);
  const uploadStatusLabel = uploadState === "preparing"
    ? "Preparando imagem…"
    : uploadState === "optimizing"
      ? "Otimizando para personalização…"
      : uploadState === "ready"
        ? "Imagem pronta para editar"
        : null;

  useEffect(() => {
    return () => {
      if (uploadReadyTimeoutRef.current) window.clearTimeout(uploadReadyTimeoutRef.current);
    };
  }, []);

  const handleReset = useCallback(() => {
    setScale(DEFAULTS.scale);
    setPosition(DEFAULTS.position);
    setRotation(DEFAULTS.rotation);
    if (originalImage) {
      setImage(originalImage);
      setActiveFilterId(null);
      setFilteredImage(null);
      setFilterHistory([]);
    }
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug, originalImage]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleExpand = useCallback(async () => {
    let res = imageResolution;
    if (!res && image) {
      try {
        res = await getImageResolution(image);
        setImageResolution(res);
      } catch {
        return;
      }
    }
    if (!res) return;

    const phoneRatio = PHONE_W / PHONE_H;
    const imgRatio = res.w / res.h;
    let newScale = imgRatio > phoneRatio ? Math.ceil((imgRatio / phoneRatio) * 100) : 100;
    newScale = Math.max(50, Math.min(200, newScale));
    setScale(newScale);
    setPosition({ x: 50, y: 50 });
    setRotation(0);
    toast({ title: "Imagem enquadrada" });
  }, [imageResolution, image, toast]);

  const processImageFile = useCallback((file: File) => {
    if (uploadReadyTimeoutRef.current) {
      window.clearTimeout(uploadReadyTimeoutRef.current);
      uploadReadyTimeoutRef.current = null;
    }
    setImageFileName(file.name);
    setIsCompressing(true);
    setUploadState("preparing");
    setActiveFilterId(null);
    setFilteredImage(null);
    setFilterHistory([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string;
      setUploadState("optimizing");
      const res = await getImageResolution(originalDataUrl);
      setImageResolution(res);

      if (res.w < 400 || res.h < 800) {
        toast({
          title: "Qualidade baixa para impressão",
          description: `${res.w}×${res.h}px — use o Upscale IA para melhorar.`,
          variant: "destructive",
          action: <ToastAction altText="Upscale IA" onClick={() => { if (!user) { setLoginReason("upscale"); setShowLoginDialog(true); return; } filterFlow.setShowUpscaleDialog(true); }}>✨ Upscale IA</ToastAction>,
        });
      }

      const { url, compressed } = await compressImage(originalDataUrl);
      setImage(url);
      setRawImage(url);
      setOriginalImage(url);
      setIsCompressing(false);
      setUploadState("ready");
      uploadReadyTimeoutRef.current = window.setTimeout(() => {
        setUploadState("idle");
        uploadReadyTimeoutRef.current = null;
      }, 1600);
      if (compressed) toast({ title: "Imagem otimizada automaticamente" });
      trackImageUploaded();
    };

    reader.readAsDataURL(file);
  }, [toast, user, filterFlow, trackImageUploaded]);

  const handleImageUpload = useCallback((file: File) => {
    if (termsAccepted.current) {
      processImageFile(file);
      return;
    }
    setPendingFile(file);
    setShowTermsDialog(true);
  }, [processImageFile]);

  const handleTermsAccept = useCallback(() => {
    termsAccepted.current = true;
    setShowTermsDialog(false);
    if (pendingFile) {
      processImageFile(pendingFile);
      setPendingFile(null);
    }
  }, [pendingFile, processImageFile]);

  const handleFilterConfirm = useCallback(async () => {
    await filterFlow.handleFilterConfirm();
    trackFilterApplied();
  }, [filterFlow, trackFilterApplied]);

  const handleGalleryImageSelect = useCallback(async (url: string) => {
    setActiveFilterId(null);
    setFilteredImage(null);
    setFilterHistory([]);
    setImageFileName(null);
    setRawImage(null);
    await setImageWithResolution(url);
    setOriginalImage(url);
    trackGalleryImageSelected();
    toast({ title: "Imagem da galeria aplicada" });
  }, [setImageWithResolution, trackGalleryImageSelected, toast]);

  const handleContinue = useCallback(async () => {
    await renderFlow.handleContinue({
      product: product ? { id: product.id, slug: product.slug, name: product.name, price_cents: product.price_cents } : null,
      userId: user?.id,
      image,
      rawImage,
      originalImage,
      filteredImage,
      imageFileName,
      scale,
      position,
      rotation,
      activeFilterId,
      filterHistory,
    });
  }, [renderFlow, product, user?.id, image, rawImage, originalImage, filteredImage, imageFileName, scale, position, rotation, activeFilterId, filterHistory]);

  const handleDownload = useCallback(async () => {
    await renderFlow.handleDownload(filteredImage || image, productName);
  }, [renderFlow, filteredImage, image, productName]);

  return {
    product,
    productLoading,
    productName,
    draftSaved,
    restoring,
    image,
    imageResolution,
    isHD,
    scale,
    position,
    rotation,
    setScale,
    setPosition,
    filters: filterFlow.filters,
    filterCategories: filterFlow.filterCategories,
    activeFilterId,
    applyingFilterId: filterFlow.applyingFilterId,
    pendingFilterId: filterFlow.pendingFilterId,
    filteredImage,
    filterHistory,
    showUpscaleDialog: filterFlow.showUpscaleDialog,
    setShowUpscaleDialog: filterFlow.setShowUpscaleDialog,
    showLowResDialog: filterFlow.showLowResDialog,
    setShowLowResDialog: filterFlow.setShowLowResDialog,
    handleLowResUpscale: filterFlow.handleLowResUpscale,
    setPendingFilterId: filterFlow.setPendingFilterId,
    showLoginDialog,
    setShowLoginDialog,
    loginReason,
    showTermsDialog,
    setShowTermsDialog,
    handleTermsAccept,
    coinBalance,
    aiFilterCost,
    aiUpscaleCost,
    isModified,
    isProcessing,
    uploadState,
    uploadStatusLabel,
    isCompressing,
    isRendering: renderFlow.isRendering,
    isUpscaling: filterFlow.isUpscaling,
    processingMsg: filterFlow.processingMsg,
    handleReset,
    handleRotate,
    handleExpand,
    handleImageUpload,
    handleFilterClick: filterFlow.handleFilterClick,
    handleFilterConfirm,
    handleRemoveFilter: filterFlow.handleRemoveFilter,
    handleUndoLastFilter: filterFlow.handleUndoLastFilter,
    handleCompareStart: filterFlow.handleCompareStart,
    handleCompareEnd: filterFlow.handleCompareEnd,
    handleUpscaleClick: filterFlow.handleUpscaleClick,
    handleUpscaleConfirm: filterFlow.handleUpscaleConfirm,
    handleContinue,
    handleDownload,
    handleGalleryImageSelect,
  };
}
