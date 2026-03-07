import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PhonePreview from "@/components/PhonePreview";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, PHONE_W, PHONE_H, type AiFilter } from "@/lib/customize-types";
import { compressImage, renderSnapshot } from "@/lib/image-utils";
import { useCoins } from "@/hooks/useCoins";
import { useCoinSettings } from "@/hooks/useCoinSettings";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import ImageControls from "@/components/customize/ImageControls";
import ContinueBar from "@/components/customize/ContinueBar";
import FilterConfirmDialog from "@/components/customize/FilterConfirmDialog";
import UpscaleConfirmDialog from "@/components/customize/UpscaleConfirmDialog";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const draftRestored = useRef(false);
  const { upsert: upsertPending, fetchByProduct: fetchPending, getSignedUrl } = usePendingCheckout();

  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", description: "Redirecionando ao catálogo.", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const [image, setImage] = useState<string | null>(null);
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
  const { balance: coinBalance, refresh: refreshCoins } = useCoins();
  const { getSetting } = useCoinSettings();
  const aiFilterCost = getSetting("ai_filter_cost", 10);
  const aiUpscaleCost = getSetting("ai_upscale_cost", 5);

  const isHD = !!(imageResolution && imageResolution.w >= 800 && imageResolution.h >= 1600);

  // Load AI filters
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

  // Draft restore (sessionStorage first, then DB fallback)
  useEffect(() => {
    if (!product?.slug || !product?.id || draftRestored.current) return;
    draftRestored.current = true;
    const key = `draft-customize-${product.slug}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (d.image) { setImage(d.image); setOriginalImage(d.image); }
        if (d.scale != null) setScale(d.scale);
        if (d.position) setPosition(d.position);
        if (d.rotation != null) setRotation(d.rotation);
        toast({ title: "Rascunho restaurado" });
      } catch { /* ignore */ }
      return;
    }
    // DB fallback
    if (!user) return;
    (async () => {
      const pending = await fetchPending(product.id);
      if (!pending) return;
      const cd = pending.customization_data as any;
      if (cd.scale != null) setScale(cd.scale);
      if (cd.position) setPosition(cd.position);
      if (cd.rotation != null) setRotation(cd.rotation);
      // Restore image from storage
      const imgPath = pending.edited_image_path || pending.original_image_path;
      if (imgPath) {
        const url = await getSignedUrl(imgPath);
        if (url) { setImage(url); setOriginalImage(url); }
      }
      toast({ title: "Rascunho recuperado" });
    })();
  }, [product?.slug, product?.id, user, toast]);

  // Auto-save draft
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

  const isModified = scale !== DEFAULTS.scale ||
    position.x !== DEFAULTS.position.x || position.y !== DEFAULTS.position.y ||
    rotation !== DEFAULTS.rotation;

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

  const handleExpand = useCallback(() => {
    if (!imageResolution) return;
    const phoneRatio = PHONE_W / PHONE_H; // ~0.489
    const imgRatio = imageResolution.w / imageResolution.h;
    // Calculate minimum scale to fill the frame
    let newScale: number = imgRatio > phoneRatio
      ? Math.ceil((imgRatio / phoneRatio) * 100)
      : 100;
    newScale = Math.max(50, Math.min(200, newScale));
    setScale(newScale);
    setPosition({ x: 50, y: 50 });
    setRotation(0);
    toast({ title: "Imagem enquadrada" });
  }, [imageResolution, toast]);

  const handleImageUpload = (file: File) => {
    setImageFileName(file.name);
    setIsCompressing(true);
    setActiveFilterId(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = async () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setImageResolution({ w, h });
        if (w < 400 || h < 800) {
          toast({ title: "Resolução muito baixa", description: `${w}×${h}px — a impressão pode ficar pixelada. Recomendado: 827×1772px.`, variant: "destructive" });
        } else if (w < 800 || h < 1600) {
          toast({ title: "Resolução baixa", description: `${w}×${h}px — recomendado 827×1772px para melhor qualidade.` });
        }
        const { url, compressed } = await compressImage(originalDataUrl);
        setImage(url);
        setOriginalImage(url);
        setIsCompressing(false);
        if (compressed) toast({ title: "Imagem otimizada automaticamente" });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFilterClick = (filterId: string) => {
    if (!image || applyingFilterId) return;
    if (activeFilterId === filterId) {
      if (originalImage) { setImage(originalImage); setActiveFilterId(null); setFilteredImage(null); }
      return;
    }
    if (imageResolution && (imageResolution.w < 256 || imageResolution.h < 256)) {
      toast({ title: "Imagem muito pequena", description: "Use uma imagem com pelo menos 256×256px para aplicar filtros IA.", variant: "destructive" });
      return;
    }
    setPendingFilterId(filterId);
  };

  const handleFilterConfirm = async () => {
    if (!pendingFilterId || !image) return;
    const filterId = pendingFilterId;
    setPendingFilterId(null);
    const sourceImage = originalImage || image;
    setApplyingFilterId(filterId);
    try {
      const { data, error } = await supabase.functions.invoke("apply-ai-filter", {
        body: { imageBase64: sourceImage, filterId },
      });
      if (error || !data?.image) {
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
      if (!originalImage) setOriginalImage(image);
      setImage(data.image);
      setFilteredImage(data.image);
      setActiveFilterId(filterId);
      refreshCoins();
    } catch {
      toast({ title: "Erro ao aplicar filtro", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
    }
  };

  const handleUpscaleClick = () => {
    if (!image || isUpscaling || isHD) return;
    setShowUpscaleDialog(true);
  };

  const handleUpscaleConfirm = async () => {
    if (!image) return;
    setShowUpscaleDialog(false);
    setIsUpscaling(true);
    try {
      const sourceImage = originalImage || image;
      const { data, error } = await supabase.functions.invoke("upscale-image", {
        body: { imageBase64: sourceImage },
      });
      if (error || !data?.image) {
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
      setImage(data.image);
      setOriginalImage(data.image);
      if (data.width && data.height) {
        setImageResolution({ w: data.width, h: data.height });
      }
      setActiveFilterId(null);
      refreshCoins();
      toast({ title: "Upscale concluído!", description: `Nova resolução: ${data.width}×${data.height}px` });
    } catch {
      toast({ title: "Erro no upscale", variant: "destructive" });
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleContinue = async () => {
    if (!product || !image) return;
    setIsRendering(true);
    try {
      const editedImage = await renderSnapshot(image, scale, position, rotation);
      const customData = { image, editedImage, imageFileName, scale, position, rotation };
      try {
        sessionStorage.setItem("customization", JSON.stringify(customData));
      } catch {
        try {
          sessionStorage.setItem("customization", JSON.stringify({ ...customData, image: null }));
        } catch {
          toast({ title: "Erro ao salvar customização", variant: "destructive" });
          return;
        }
      }

      // Persist to DB for recovery
      if (user) {
        try {
          const ts = Date.now();
          let originalPath: string | null = null;
          let editedPath: string | null = null;
          const sourceImg = originalImage || image;
          if (sourceImg) {
            const blob = await fetch(sourceImg).then(r => r.blob());
            const ext = imageFileName?.split(".").pop() || "png";
            const path = `${user.id}/pending_orig_${ts}.${ext}`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            originalPath = path;
          }
          if (editedImage) {
            const blob = await fetch(editedImage).then(r => r.blob());
            const path = `${user.id}/pending_edit_${ts}.jpg`;
            await supabase.storage.from("customizations").upload(path, blob, { upsert: true });
            editedPath = path;
          }
          await upsertPending(
            product.id,
            { scale, position, rotation, activeFilter: activeFilterId },
            originalPath,
            editedPath,
          );
        } catch (e) {
          // silently ignore persistence failures
        }
      }

      if (product.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
      navigate(`/checkout/${product.slug}`);
    } finally {
      setIsRendering(false);
    }
  };

  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";
  const isProcessing = isCompressing || isRendering || !!applyingFilterId || isUpscaling;

  if (productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden">
      <CustomizeHeader
        productName={productName}
        onBack={() => navigate(product ? `/product/${product.slug}` : "/catalog")}
      />

      <main className="flex-1 flex flex-col items-center justify-center gap-3 px-4 overflow-hidden">
        <PhonePreview
          image={image} scale={scale} position={position} rotation={rotation}
          onPositionChange={setPosition} onScaleChange={setScale} onImageUpload={handleImageUpload}
          imageResolution={imageResolution} isProcessing={isProcessing}
        />

        <ImageControls
          hasImage={!!image}
          scale={scale}
          rotation={rotation}
          onScaleChange={setScale}
          onRotate={handleRotate}
          onExpand={handleExpand}
          onUpscale={handleUpscaleClick}
          isHD={isHD}
          upscaleCost={aiUpscaleCost}
          isUpscaling={isUpscaling}
          filters={filters}
          activeFilterId={activeFilterId}
          applyingFilterId={applyingFilterId}
          filterCost={aiFilterCost}
          onFilterClick={handleFilterClick}
          onCompareStart={handleCompareStart}
          onCompareEnd={handleCompareEnd}
          onRemoveFilter={handleRemoveFilter}
        />
      </main>

      <ContinueBar
        isModified={isModified}
        onReset={handleReset}
        onContinue={handleContinue}
        disabled={!image || isProcessing}
        isRendering={isRendering}
      />

      <FilterConfirmDialog
        filter={filters.find((f) => f.id === pendingFilterId) ?? null}
        balance={coinBalance}
        cost={aiFilterCost}
        open={!!pendingFilterId}
        onOpenChange={(open) => { if (!open) setPendingFilterId(null); }}
        onConfirm={handleFilterConfirm}
      />

      <UpscaleConfirmDialog
        balance={coinBalance}
        cost={aiUpscaleCost}
        open={showUpscaleDialog}
        onOpenChange={setShowUpscaleDialog}
        onConfirm={handleUpscaleConfirm}
      />
    </div>
  );
};

export default Customize;
