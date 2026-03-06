import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCw, RotateCcw, Loader2, Maximize, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import PhonePreview from "@/components/PhonePreview";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

const DEFAULTS = { scale: 100, position: { x: 50, y: 50 }, rotation: 0 };
const PHONE_W = 260;
const PHONE_H = 532;

interface AiFilter {
  id: string;
  name: string;
  style_image_url: string | null;
}

function compressImage(dataUrl: string, maxW = 1200, maxH = 2400, quality = 0.75): Promise<{ url: string; compressed: boolean }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxW && h <= maxH) { resolve({ url: dataUrl, compressed: false }); return; }
      const ratio = Math.min(maxW / w, maxH / h);
      const nw = Math.round(w * ratio);
      const nh = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = nw; canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      resolve({ url: canvas.toDataURL("image/jpeg", quality), compressed: true });
    };
    img.src = dataUrl;
  });
}

function renderSnapshot(
  imgSrc: string, scale: number,
  position: { x: number; y: number }, rotation: number, quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHONE_W; canvas.height = PHONE_H;
      const ctx = canvas.getContext("2d")!;
      const oversize = Math.max(150, scale * 1.25);
      const drawW = (scale / oversize) * PHONE_W * (oversize / 100);
      const drawH = (scale / oversize) * PHONE_H * (oversize / 100);
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cellAspect = PHONE_W / PHONE_H;
      let srcW: number, srcH: number;
      if (imgAspect > cellAspect) { srcH = img.naturalHeight; srcW = srcH * cellAspect; }
      else { srcW = img.naturalWidth; srcH = srcW / cellAspect; }
      const maxOffX = img.naturalWidth - srcW;
      const maxOffY = img.naturalHeight - srcH;
      const srcX = (position.x / 100) * maxOffX;
      const srcY = (position.y / 100) * maxOffY;

      // Apply rotation
      ctx.save();
      ctx.translate(PHONE_W / 2, PHONE_H / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-PHONE_W / 2, -PHONE_H / 2);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, (PHONE_W - drawW) / 2, (PHONE_H - drawH) / 2, drawW, drawH);
      ctx.restore();

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = imgSrc;
  });
}

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

  // AI Filters
  const [filters, setFilters] = useState<AiFilter[]>([]);

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
        if (compressed) {
          toast({ title: "Imagem otimizada automaticamente" });
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFilterClick = async (filterId: string) => {
    if (!image || applyingFilterId) return;
    // Toggle: clicking active filter reverts to original
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
        toast({ title: "Erro ao aplicar filtro", description: "Tente novamente.", variant: "destructive" });
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

  if (productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => navigate(product ? `/product/${product.slug}` : "/catalog")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground truncate">{productName}</span>
        <div className="w-9" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center gap-3 px-4 overflow-hidden">
        <PhonePreview
          image={image} scale={scale} position={position} rotation={rotation}
          onPositionChange={setPosition} onScaleChange={setScale} onImageUpload={handleImageUpload}
          imageResolution={imageResolution} isProcessing={isCompressing || isRendering || !!applyingFilterId}
        />

        {/* Controls */}
        <div className={`w-full max-w-xs space-y-3 ${!image ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Zoom slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Maximize className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Zoom</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${scale !== 100 ? "text-primary" : "text-muted-foreground/40"}`}>
                {scale}%
              </span>
            </div>
            <Slider
              value={[scale]}
              onValueChange={(v) => setScale(v[0])}
              min={50}
              max={200}
              step={1}
              disabled={!image}
            />
          </div>

          {/* Rotation button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRotate}
              disabled={!image}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="text-xs">Girar 90°</span>
            </Button>
            {rotation !== 0 && (
              <span className="text-[10px] font-mono text-primary">{rotation}°</span>
            )}
          </div>

          {/* AI Filters */}
          {filters.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Filtros IA</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
                {filters.map((filter) => {
                  const isActive = activeFilterId === filter.id;
                  const isProcessing = applyingFilterId === filter.id;
                  return (
                    <Button
                      key={filter.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5 flex-shrink-0"
                      onClick={() => handleFilterClick(filter.id)}
                      disabled={!!applyingFilterId || !image}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : filter.style_image_url ? (
                        <img
                          src={filter.style_image_url}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : null}
                      {filter.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop continue */}
        <div className="hidden lg:flex items-center gap-2 w-full max-w-xs">
          {isModified && (
            <Button variant="ghost" size="icon" onClick={handleReset} className="shrink-0 text-muted-foreground h-10 w-10">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Button className="flex-1 gap-1.5" onClick={handleContinue} disabled={!image || isCompressing || isRendering || !!applyingFilterId}>
            {isRendering ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
            ) : (
              <>Continuar <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </main>

      {/* Mobile sticky bottom bar */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-4 py-3">
          {isModified && (
            <Button variant="ghost" size="icon" onClick={handleReset} className="shrink-0 text-muted-foreground h-10 w-10">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1" />
          <Button className="gap-1.5 shrink-0" onClick={handleContinue} disabled={!image || isCompressing || isRendering || !!applyingFilterId}>
            {isRendering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Continuar <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Customize;
