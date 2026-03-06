import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Loader2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import PhonePreview from "@/components/PhonePreview";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

const DEFAULTS = { scale: 100, position: { x: 50, y: 50 } };
const PHONE_W = 260;
const PHONE_H = 532;

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
  position: { x: number; y: number }, quality = 0.85
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
      ctx.drawImage(img, srcX, srcY, srcW, srcH, (PHONE_W - drawW) / 2, (PHONE_H - drawH) / 2, drawW, drawH);
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
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [imageResolution, setImageResolution] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [position, setPosition] = useState(DEFAULTS.position);

  // Draft restore
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
      if (d.position) setPosition(d.position);
      toast({ title: "Rascunho restaurado" });
    } catch { /* ignore */ }
  }, [product?.slug, toast]);

  // Auto-save draft
  useEffect(() => {
    if (!product?.slug) return;
    const timeout = setTimeout(() => {
      const key = `draft-customize-${product.slug}`;
      try {
        sessionStorage.setItem(key, JSON.stringify({ image, scale, position }));
      } catch { /* ignore quota */ }
    }, 500);
    return () => clearTimeout(timeout);
  }, [product?.slug, image, scale, position]);

  const isModified = scale !== DEFAULTS.scale ||
    position.x !== DEFAULTS.position.x || position.y !== DEFAULTS.position.y;

  const handleReset = useCallback(() => {
    setScale(DEFAULTS.scale);
    setPosition(DEFAULTS.position);
    if (product?.slug) sessionStorage.removeItem(`draft-customize-${product.slug}`);
  }, [product?.slug]);

  const handleImageUpload = (file: File) => {
    setImageFileName(file.name);
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
          toast({ title: "Resolução muito baixa", description: `Sua imagem tem ${w}×${h}px. Para boa qualidade, envie no mínimo 827×1772px.`, variant: "destructive" });
        } else if (w < 800 || h < 1600) {
          toast({ title: "Resolução pode ser insuficiente", description: `Sua imagem tem ${w}×${h}px. Recomendamos 827×1772px ou superior.` });
        }
        const { url, compressed } = await compressImage(originalDataUrl);
        setImage(url);
        setIsCompressing(false);
        if (compressed) {
          toast({ title: "Imagem otimizada automaticamente" });
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = async () => {
    if (!product || !image) return;
    setIsRendering(true);
    try {
      const editedImage = await renderSnapshot(image, scale, position);
      const customData = { image, editedImage, imageFileName, scale, position };
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
  const productPrice = product ? formatPrice(product.price_cents / 100) : "";

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    ...(product ? [{ label: product.name, to: `/product/${product.slug}` }] : []),
    { label: "Customizar" },
  ];

  if (productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-4 lg:p-10 pb-28 lg:pb-10">
        <PhonePreview
          image={image} scale={scale} position={position}
          onPositionChange={setPosition} onImageUpload={handleImageUpload} modelName={productName}
          imageResolution={imageResolution} isProcessing={isCompressing || isRendering}
        />

        {/* Zoom slider */}
        <div className={`w-full max-w-xs space-y-1 ${!image ? "opacity-50 pointer-events-none" : ""}`}>
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

        {/* Desktop continue */}
        <div className="hidden lg:block w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">{productPrice}</span>
          </div>
          <Button className="w-full gap-1.5" onClick={handleContinue} disabled={!image || isCompressing || isRendering}>
            {isRendering ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
            ) : (
              <>Continuar <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </main>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-4 py-3">
          {isModified && (
            <Button variant="ghost" size="icon" onClick={handleReset} className="shrink-0 text-muted-foreground h-10 w-10">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground">{productPrice}</span>
          </div>
          <Button className="gap-1.5 shrink-0" onClick={handleContinue} disabled={!image || isCompressing || isRendering}>
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
