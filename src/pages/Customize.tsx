import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PhonePreview from "@/components/PhonePreview";
import ControlPanel from "@/components/ControlPanel";
import FilterPresets, { filters } from "@/components/FilterPresets";
import AppHeader from "@/components/AppHeader";
import { getProduct } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id ?? "");
  const { toast } = useToast();
  const { user } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelectFilter = (filterId: string | null) => {
    setActiveFilter(filterId);
    if (filterId) {
      setBrightness(0);
      setContrast(0);
    }
  };

  const handleBrightnessChange = (v: number) => {
    setBrightness(v);
    if (activeFilter) setActiveFilter(null);
  };

  const handleContrastChange = (v: number) => {
    setContrast(v);
    if (activeFilter) setActiveFilter(null);
  };

  const handleCheckout = async () => {
    if (!user || !product) return;

    setCheckoutLoading(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if present
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("customizations")
          .upload(path, imageFile);

        if (uploadError) {
          throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
        }
        imageUrl = path;
      }

      const customizationData = {
        scale,
        rotation,
        brightness,
        contrast,
        activeFilter,
        position,
      };

      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            product_id: product.id,
            customization_data: customizationData,
            image_url: imageUrl,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Erro no checkout",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      productId: id,
      image,
      scale,
      rotation,
      brightness,
      contrast,
      activeFilter,
      position,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`draft-${id}`, JSON.stringify(draft));
    toast({
      title: "Rascunho salvo!",
      description: "Seu design foi salvo com sucesso.",
    });
  };

  const activeFilterObj = filters.find((f) => f.id === activeFilter);
  const extraFilter = activeFilterObj?.cssFilter ?? undefined;

  const productName = product?.name?.replace("Capa ", "") ?? "iPhone";

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    ...(product ? [{ label: product.name, to: `/product/${product.id}` }] : []),
    { label: "Customizar" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-5 lg:p-10">
        <div className="flex-shrink-0">
          <PhonePreview
            image={image}
            scale={scale}
            rotation={rotation}
            brightness={brightness}
            contrast={contrast}
            extraFilter={extraFilter}
            position={position}
            onPositionChange={setPosition}
            onImageUpload={handleImageUpload}
            modelName={productName}
          />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <Tabs defaultValue="adjust" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="adjust" className="flex-1">Ajustes</TabsTrigger>
              <TabsTrigger value="filters" className="flex-1">Filtros</TabsTrigger>
            </TabsList>
            <TabsContent value="adjust">
              <ControlPanel
                scale={scale}
                rotation={rotation}
                brightness={brightness}
                contrast={contrast}
                onScaleChange={setScale}
                onRotationChange={setRotation}
                onBrightnessChange={handleBrightnessChange}
                onContrastChange={handleContrastChange}
              />
            </TabsContent>
            <TabsContent value="filters">
              <FilterPresets
                image={image}
                activeFilter={activeFilter}
                onSelectFilter={handleSelectFilter}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSaveDraft}
            >
              Salvar Rascunho
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Finalizar Pedido
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customize;
