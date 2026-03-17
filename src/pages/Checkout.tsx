import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { type ShippingResult } from "@/lib/shipping";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentBadges from "@/components/PaymentBadges";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent, generateEventId } from "@/lib/meta-pixel";

interface CustomizationData {
  rawImage: string | null;
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
  const { fetchByProduct, remove: removePending, getSignedUrl } = usePendingCheckout();

  const [customization, setCustomization] = useState<CustomizationData | null>(null);
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const handleAddressChange = useCallback((data: AddressData, valid: boolean) => {
    setAddressData(data);
    setIsAddressValid(valid);
    if (valid) clarityEvent("checkout_address_filled");
  }, []);

  // Meta Pixel: InitiateCheckout (with event_id for CAPI dedup)
  const pixelFired = useRef(false);
  const initiateCheckoutEventId = useRef(generateEventId());
  useEffect(() => {
    if (product && !pixelFired.current) {
      pixelFired.current = true;
      pixelEvent("InitiateCheckout", { content_ids: [product.id], content_type: "product", value: product.price_cents / 100, currency: "BRL" }, initiateCheckoutEventId.current);
    }
  }, [product]);

  // Load customization from sessionStorage, fallback to DB
  useEffect(() => {
    const raw = sessionStorage.getItem("customization");
    if (raw) {
      setCustomization(JSON.parse(raw));
      return;
    }
    // Fallback: recover from DB
    if (!product?.id || !user) return;
    setRecovering(true);
    (async () => {
      try {
        const pending = await fetchByProduct(product.id);
        if (!pending) {
          toast({ title: "Customização não encontrada", description: "Volte e personalize sua capinha.", variant: "destructive" });
          navigate(`/customize/${id}`, { replace: true });
          return;
        }
        const cd = pending.customization_data as any;
        let imgUrl: string | null = null;
        let editedUrl: string | null = null;
        if (pending.edited_image_path) editedUrl = await getSignedUrl(pending.edited_image_path);
        if (pending.original_image_path) imgUrl = await getSignedUrl(pending.original_image_path);
        setCustomization({
          rawImage: imgUrl,
          image: imgUrl,
          editedImage: editedUrl,
          imageFileName: null,
          scale: cd.scale ?? 100,
          rotation: cd.rotation ?? 0,
          brightness: 100,
          contrast: 100,
          activeFilter: cd.activeFilter ?? null,
          position: cd.position ?? { x: 50, y: 50 },
        });
        toast({ title: "Pedido pendente recuperado" });
      } catch {
        toast({ title: "Customização não encontrada", description: "Volte e personalize sua capinha.", variant: "destructive" });
        navigate(`/customize/${id}`, { replace: true });
      } finally {
        setRecovering(false);
      }
    })();
  }, [product?.id, user, id, navigate, toast]);

  // Redirect if product not found
  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const handleEditCustomization = () => {
    if (!product?.slug || !customization) return;
    // Save current data as draft so Customize.tsx auto-restores it
    const key = `draft-customize-${product.slug}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({
        image: customization.image,
        scale: customization.scale,
        position: customization.position,
        rotation: customization.rotation,
      }));
    } catch { /* ignore */ }
    navigate(`/customize/${product.slug}`);
  };

  const handleCheckout = async () => {
    if (!user || !product || !customization || !shipping || !addressData) return;
    setSubmitted(true);
    if (!isAddressValid) return;
    clarityEvent("checkout_payment_started");
    setCheckoutLoading(true);
    try {
      let rawImageUrl: string | null = null;
      let originalImageUrl: string | null = null;
      let editedImageUrl: string | null = null;
      const ts = Date.now();

      // Upload raw image (original user upload, untouched)
      const rawSrc = customization.rawImage || customization.image;
      if (rawSrc) {
        const blob = await fetch(rawSrc).then((r) => r.blob());
        const ext = customization.imageFileName?.split(".").pop() || "png";
        const path = `${user.id}/original_${ts}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem original: " + uploadError.message);
        rawImageUrl = path;
      }

      // Upload optimized image (after filters/upscale, max quality)
      if (customization.image) {
        const blob = await fetch(customization.image).then((r) => r.blob());
        const path = `${user.id}/optimized_${ts}.jpg`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem otimizada: " + uploadError.message);
        originalImageUrl = path;
      }

      // Upload final image (snapshot with frame positioning)
      if (customization.editedImage) {
        const blob = await fetch(customization.editedImage).then((r) => r.blob());
        const path = `${user.id}/final_${ts}.jpg`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem final: " + uploadError.message);
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
          raw_image_url: rawImageUrl,
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
      console.error("Checkout error:", err?.message);
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

  if (productLoading || !customization || recovering) {
    return <LoadingSpinner variant="fullPage" />;
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
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">{product?.name}</p>
              <p className="text-xs text-muted-foreground">Customização pronta</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={handleEditCustomization}
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
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
          aiFilterApplied={!!customization?.activeFilter}
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

        <PaymentBadges />
      </main>
    </div>
  );
};

export default Checkout;
