import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhonePreview from "@/components/PhonePreview";
import ControlPanel from "@/components/ControlPanel";
import FilterPresets, { filters } from "@/components/FilterPresets";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

const DEFAULTS = { scale: 100, rotation: 0, brightness: 0, contrast: 0, activeFilter: null as string | null, position: { x: 50, y: 50 } };
const PHONE_W = 260;
const PHONE_H = 532;

function compressImage(dataUrl: string, maxW = 2000, maxH = 4000, quality = 0.85): Promise<{ url: string; compressed: boolean }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxW && h <= maxH) {
        resolve({ url: dataUrl, compressed: false });
        return;
      }
      const ratio = Math.min(maxW / w, maxH / h);
      const nw = Math.round(w * ratio);
      const nh = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      resolve({ url: canvas.toDataURL("image/jpeg", quality), compressed: true });
    };
    img.src = dataUrl;
  });
}

function renderSnapshot(
  imgSrc: string, scale: number, rotation: number,
  brightness: number, contrast: number, filterCss: string | undefined,
  position: { x: number; y: number }, quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHONE_W;
      canvas.height = PHONE_H;
      const ctx = canvas.getContext("2d")!;

      ctx.save();
      const baseFilter = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`;
      ctx.filter = filterCss ? `${baseFilter} ${filterCss}` : baseFilter;

      const oversize = Math.max(150, scale * 1.25);
      const drawW = (scale / oversize) * PHONE_W * (oversize / 100);
      const drawH = (scale / oversize) * PHONE_H * (oversize / 100);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cellAspect = PHONE_W / PHONE_H;
      let srcW: number, srcH: number;
      if (imgAspect > cellAspect) {
        srcH = img.naturalHeight;
        srcW = srcH * cellAspect;
      } else {
        srcW = img.naturalWidth;
        srcH = srcW / cellAspect;
      }
      const maxOffX = img.naturalWidth - srcW;
      const maxOffY = img.naturalHeight - srcH;
      const srcX = (position.x / 100) * maxOffX;
      const srcY = (position.y / 100) * maxOffY;

      ctx.translate(PHONE_W / 2, PHONE_H / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [imageResolution, setImageResolution] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [rotation, setRotation] = useState(DEFAULTS.rotation);
  const [brightness, setBrightness] = useState(DEFAULTS.brightness);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [activeFilter, setActiveFilter] = useState<string | null>(DEFAULTS.activeFilter);
  const [position, setPosition] = useState(DEFAULTS.position);

  // --- Draft restore on mount ---
  useEffect(() => {
    if (!product?.slug || draftRestored.current) return;
    draftRestored.current = true;
    const key = `draft-customize-${product.slug}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.image) setImage(d.image);
      if (d.scale != null) setScale(d.scale);
      if (d.rotation != null) setRotation(d.rotation);
      if (d.brightness != null) setBrightness(d.brightness);
      if (d.contrast != null) setContrast(d.contrast);
      if (d.activeFilter !== undefined) setActiveFilter(d.activeFilter);
      if (d.position) setPosition(d.position);
      toast({ title: "Rascunho restaurado" });
    } catch { /* ignore corrupt data */ }
  }, [product?.slug, toast]);

  // --- Auto-save draft with debounce ---
  useEffect(() => {
    if (!product?.slug) return;
    const timeout = setTimeout(() => {
      const key = `draft-customize-${product.slug}`;
      sessionStorage.setItem(key, JSON.stringify({ image, scale, rotation, brightness, contrast, activeFilter, position }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [product?.slug, image, scale, rotation, brightness, contrast, activeFilter, position]);

  const isModified = scale !== DEFAULTS.scale || rotation !== DEFAULTS.rotation ||
    brightness !== DEFAULTS.brightness || contrast !== DEFAULTS.contrast ||
    activeFilter !== DEFAULTS.activeFilter ||
    position.x !== DEFAULTS.position.x || position.y !== DEFAULTS.position.y;

  const handleReset = useCallback(() => {
    setScale(DEFAULTS.scale);
    setRotation(DEFAULTS.rotation);
    setBrightness(DEFAULTS.brightness);
    setContrast(DEFAULTS.contrast);
    setActiveFilter(DEFAULTS.activeFilter);
    setPosition(DEFAULTS.position);
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug]);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = async () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setImageResolution({ w, h });
        if (w < 400 || h < 800) {
          toast({ title: "Resolução muito baixa", description: `Sua imagem tem ${w}×${h}px. Para boa qualidade de impressão, envie no mínimo 827×1772px.`, variant: "destructive" });
        } else if (w < 800 || h < 1600) {
          toast({ title: "Resolução pode ser insuficiente", description: `Sua imagem tem ${w}×${h}px. Recomendamos 827×1772px ou superior para melhor qualidade.` });
        }
        const { url, compressed } = await compressImage(originalDataUrl);
        setImage(url);
        setIsCompressing(false);
        if (compressed) {
          toast({ title: "Imagem otimizada automaticamente", description: "A imagem foi redimensionada para melhor performance." });
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFilter = (filterId: string | null) => {
    setActiveFilter(filterId);
    if (filterId) { setBrightness(0); setContrast(0); }
  };

  const handleBrightnessChange = (v: number) => { setBrightness(v); if (activeFilter) setActiveFilter(null); };
  const handleContrastChange = (v: number) => { setContrast(v); if (activeFilter) setActiveFilter(null); };

  const handleContinue = async () => {
    if (!product || !image) return;
    setIsRendering(true);
    try {
      const activeFilterObj = filters.find((f) => f.id === activeFilter);
      const filterCss = activeFilterObj?.cssFilter ?? undefined;
      const editedImage = await renderSnapshot(image, scale, rotation, brightness, contrast, filterCss, position);
      const customData = {
        image,
        editedImage,
        imageFileName: imageFile?.name || null,
        scale, rotation, brightness, contrast, activeFilter, position,
      };
      sessionStorage.setItem("customization", JSON.stringify(customData));
      if (product.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
      navigate(`/checkout/${product.slug}`);
    } finally {
      setIsRendering(false);
    }
  };

  const activeFilterObj = filters.find((f) => f.id === activeFilter);
  const extraFilter = activeFilterObj?.cssFilter ?? undefined;
  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    ...(product ? [{ label: product.name, to: `/product/${product.slug}` }] : []),
    { label: "Customizar" },
  ];

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-5 lg:p-10">
        <div className="flex-shrink-0">
          <PhonePreview
            image={image} scale={scale} rotation={rotation} brightness={brightness}
            contrast={contrast} extraFilter={extraFilter} position={position}
            onPositionChange={setPosition} onImageUpload={handleImageUpload} modelName={productName}
            imageResolution={imageResolution} isProcessing={isCompressing || isRendering}
          />
        </div>
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Customizar</h1>
            {isModified && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" /> Resetar
              </Button>
            )}
          </div>

          <FilterPresets image={image} activeFilter={activeFilter} onSelectFilter={handleSelectFilter} disabled={!image} />

          <ControlPanel scale={scale} rotation={rotation} brightness={brightness} contrast={contrast}
            onScaleChange={setScale} onRotationChange={setRotation}
            onBrightnessChange={handleBrightnessChange} onContrastChange={handleContrastChange} disabled={!image} />

          <Button className="w-full gap-1.5" onClick={handleContinue} disabled={!image || isCompressing || isRendering}>
            {isRendering ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
            ) : (
              <>Continuar <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Customize;
