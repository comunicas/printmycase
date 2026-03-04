import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { type ShippingResult } from "@/lib/shipping";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";

interface CustomizationData {
  image: string | null;
  editedImage: string | null;
  imageFileName: string | null;
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  activeFilter: string | null;
  position: { x: number; y: number };
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customization, setCustomization] = useState<CustomizationData | null>(null);
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);

  const handleAddressChange = useCallback((data: AddressData, valid: boolean) => {
    setAddressData(data);
    setIsAddressValid(valid);
  }, []);

  // Load customization from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("customization");
    if (!raw) {
      toast({ title: "Customização não encontrada", description: "Volte e personalize sua capa.", variant: "destructive" });
      navigate(`/customize/${id}`, { replace: true });
      return;
    }
    setCustomization(JSON.parse(raw));
  }, [id, navigate, toast]);

  // Redirect if product not found
  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const handleCheckout = async () => {
    if (!user || !product || !customization || !shipping || !addressData) return;
    setSubmitted(true);
    if (!isAddressValid) return;
    setCheckoutLoading(true);
    try {
      let originalImageUrl: string | null = null;
      let editedImageUrl: string | null = null;
      const ts = Date.now();

      // Upload original image
      if (customization.image) {
        const blob = await fetch(customization.image).then((r) => r.blob());
        const ext = customization.imageFileName?.split(".").pop() || "png";
        const path = `${user.id}/original_${ts}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem original: " + uploadError.message);
        originalImageUrl = path;
      }

      // Upload edited image (snapshot with edits applied)
      if (customization.editedImage) {
        const blob = await fetch(customization.editedImage).then((r) => r.blob());
        const path = `${user.id}/edited_${ts}.jpg`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem editada: " + uploadError.message);
        editedImageUrl = path;
      }

      const cleanZip = addressData.zipInput.replace(/\D/g, "");
      const customizationPayload = {
        scale: customization.scale,
        rotation: customization.rotation,
        brightness: customization.brightness,
        contrast: customization.contrast,
        activeFilter: customization.activeFilter,
        position: customization.position,
      };

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product_id: product.id,
          customization_data: customizationPayload,
          original_image_url: originalImageUrl,
          edited_image_url: editedImageUrl,
          shipping_cents: shipping.priceCents,
          address_id: addressData.selectedAddressId,
          address_inline: addressData.selectedAddressId ? undefined : {
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || null,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            zip_code: cleanZip,
            label: addressData.addressLabel,
          },
          save_address: !addressData.selectedAddressId && addressData.saveAddress,
        },
      });

      if (error) throw error;
      if (data?.url) {
        sessionStorage.removeItem("customization");
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({ title: "Erro no checkout", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const productPriceCents = product?.price_cents ?? 0;
  const shippingCents = shipping?.priceCents ?? 0;
  const totalCents = productPriceCents + shippingCents;

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    ...(product ? [{ label: product.name, to: `/product/${product.slug}` }] : []),
    ...(product ? [{ label: "Customizar", to: `/customize/${product.slug}` }] : []),
    { label: "Checkout" },
  ];

  if (productLoading || !customization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 max-w-xl mx-auto w-full p-5 lg:p-10 space-y-6">

        {/* Mini preview */}
        {(customization.editedImage || customization.image) && (
          <div className="flex items-center gap-4 border rounded-xl p-4 bg-card">
            <img
              src={customization.editedImage || customization.image}
              alt="Preview da customização"
              className="w-16 h-16 rounded-lg object-cover border"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{product?.name}</p>
              <p className="text-xs text-muted-foreground">Customização pronta</p>
            </div>
          </div>
        )}

        <AddressForm
          shipping={shipping}
          onShippingChange={setShipping}
          submitted={submitted}
          onAddressChange={handleAddressChange}
        />

        <OrderSummary
          productPriceCents={productPriceCents}
          shippingCents={shippingCents}
          hasShipping={!!shipping}
        />

        <Button
          className="w-full gap-1.5"
          onClick={handleCheckout}
          disabled={checkoutLoading || !isAddressValid}
        >
          {checkoutLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Finalizar Pedido <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </main>
    </div>
  );
};

export default Checkout;
