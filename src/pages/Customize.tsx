import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PhonePreview from "@/components/PhonePreview";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, type AiFilter } from "@/lib/customize-types";
import { compressImage, renderSnapshot } from "@/lib/image-utils";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import ImageControls from "@/components/customize/ImageControls";
import ContinueBar from "@/components/customize/ContinueBar";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const draftRestored = useRef(false);

  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", description: "Redirecionando ao catálogo.", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [applyingFilterId, setApplyingFilterId] = useState<string | null>(null);
  const [imageResolution, setImageResolution] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [rotation, setRotation] = useState(DEFAULTS.rotation);
  const [filters, setFilters] = useState<AiFilter[]>([]);

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

  // Draft restore
  useEffect(() => {
    if (!product?.slug || draftRestored.current) return;
    draftRestored.current = true;
    const key = `draft-customize-${product.slug}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.image) { setImage(d.image); setOriginalImage(d.image); }
      if (d.scale != null) setScale(d.scale);
      if (d.position) setPosition(d.position);
      if (d.rotation != null) setRotation(d.rotation);
      toast({ title: "Rascunho restaurado" });
    } catch { /* ignore */ }
  }, [product?.slug, toast]);

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
    if (originalImage) { setImage(originalImage); setActiveFilterId(null); }
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug, originalImage]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

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

  const handleFilterClick = async (filterId: string) => {
    if (!image || applyingFilterId) return;
    if (activeFilterId === filterId) {
      if (originalImage) { setImage(originalImage); setActiveFilterId(null); }
      return;
    }
    setApplyingFilterId(filterId);
    try {
      const sourceImage = originalImage || image;
      const { data, error } = await supabase.functions.invoke("apply-ai-filter", {
        body: { imageBase64: sourceImage, filterId },
      });
      if (error || !data?.image) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro ao aplicar filtro",
          description: isInsufficientCoins ? "Compre mais moedas para usar filtros IA." : "Tente novamente.",
          variant: "destructive",
        });
        if (isInsufficientCoins) {
          navigate("/coins");
        }
        return;
      }
      if (!originalImage) setOriginalImage(image);
      setImage(data.image);
      setActiveFilterId(filterId);
    } catch {
      toast({ title: "Erro ao aplicar filtro", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
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
      if (product.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
      navigate(`/checkout/${product.slug}`);
    } finally {
      setIsRendering(false);
    }
  };

  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";
  const isProcessing = isCompressing || isRendering || !!applyingFilterId;

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
          filters={filters}
          activeFilterId={activeFilterId}
          applyingFilterId={applyingFilterId}
          onFilterClick={handleFilterClick}
        />
      </main>

      <ContinueBar
        isModified={isModified}
        onReset={handleReset}
        onContinue={handleContinue}
        disabled={!image || isProcessing}
        isRendering={isRendering}
      />
    </div>
  );
};

export default Customize;
