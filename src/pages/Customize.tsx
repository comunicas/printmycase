import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhonePreview from "@/components/PhonePreview";
import ControlPanel from "@/components/ControlPanel";
import FilterPresets, { filters } from "@/components/FilterPresets";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", description: "Redirecionando ao catálogo.", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelectFilter = (filterId: string | null) => {
    setActiveFilter(filterId);
    if (filterId) { setBrightness(0); setContrast(0); }
  };

  const handleBrightnessChange = (v: number) => { setBrightness(v); if (activeFilter) setActiveFilter(null); };
  const handleContrastChange = (v: number) => { setContrast(v); if (activeFilter) setActiveFilter(null); };

  const handleContinue = () => {
    if (!product) return;
    const customData = {
      image, // base64
      imageFileName: imageFile?.name || null,
      scale, rotation, brightness, contrast, activeFilter, position,
    };
    sessionStorage.setItem("customization", JSON.stringify(customData));
    navigate(`/checkout/${product.slug}`);
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
          />
        </div>
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-lg font-semibold text-foreground">Customizar</h1>

          <FilterPresets image={image} activeFilter={activeFilter} onSelectFilter={handleSelectFilter} disabled={!image} />

          <ControlPanel scale={scale} rotation={rotation} brightness={brightness} contrast={contrast}
            onScaleChange={setScale} onRotationChange={setRotation}
            onBrightnessChange={handleBrightnessChange} onContrastChange={handleContrastChange} disabled={!image} />

          <Button className="w-full gap-1.5" onClick={handleContinue} disabled={!image}>
            Continuar <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Customize;
