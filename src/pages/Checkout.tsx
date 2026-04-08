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
import { useRecoverPendingCheckout } from "@/hooks/useRecoverPendingCheckout";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentBadges from "@/components/PaymentBadges";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent, generateEventId } from "@/lib/meta-pixel";
import { buildCreateCheckoutPayload } from "@/lib/checkout";
import { uploadCustomizationAsset } from "@/lib/customization-upload";
import { parseCheckoutCustomizationData, type CheckoutCustomizationData } from "@/types/customization";

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading } = useProduct(id);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recoverPendingCheckout } = useRecoverPendingCheckout();

  const [customization, setCustomization] = useState<CheckoutCustomizationData | null>(null);
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
      try {
        const parsed = parseCheckoutCustomizationData(JSON.parse(raw));
        if (parsed) {
          setCustomization(parsed);
          return;
        }
      } catch {
        // noop, fallback to pending recovery
      }
      sessionStorage.removeItem("customization");
    }

    if (!product?.id || !user) return;
    setRecovering(true);
    (async () => {
      try {
        const recovered = await recoverPendingCheckout(product.id);
        if (!recovered) {
          toast({ title: "Customização não encontrada", description: "Volte e personalize sua capinha.", variant: "destructive" });
          navigate(`/customize/${id}`, { replace: true });
          return;
        }

        setCustomization(recovered);
        toast({ title: "Pedido pendente recuperado" });
      } catch {
        toast({ title: "Customização não encontrada", description: "Volte e personalize sua capinha.", variant: "destructive" });
        navigate(`/customize/${id}`, { replace: true });
      } finally {
        setRecovering(false);
      }
    })();
  }, [product?.id, user, id, navigate, recoverPendingCheckout, toast]);

  // Redirect if product not found
  useEffect(() => {
    if (!productLoading && !product) {
      toast({ title: "Produto não encontrado", variant: "destructive" });
      navigate("/catalog", { replace: true });
    }
  }, [product, productLoading, navigate, toast]);

  const handleEditCustomization = () => {
    if (!product?.slug || !customization) return;
    const key = `draft-customize-${product.slug}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({
        image: customization.image,
        scale: customization.scale,
        position: customization.position,
        rotation: customization.rotation,
      }));
    } catch {
      // ignore
    }
    navigate(`/customize/${product.slug}`);
  };

  const handleCheckout = async () => {
    if (!user || !product || !customization || !shipping || !addressData) return;
    setSubmitted(true);
    if (!isAddressValid) return;
    clarityEvent("checkout_payment_started");
    setCheckoutLoading(true);

    try {
      const ts = Date.now();
      const rawExt = customization.imageFileName?.split(".").pop() || "png";

      const rawImageUrl = await uploadCustomizationAsset({
        sourceUrl: customization.rawImage || customization.image,
        userId: user.id,
        fileName: `original_${ts}.${rawExt}`,
        errorMessage: "Erro ao enviar imagem original. Verifique sua conexão e tente novamente.",
      });

      const originalImageUrl = await uploadCustomizationAsset({
        sourceUrl: customization.image,
        userId: user.id,
        fileName: `optimized_${ts}.jpg`,
        errorMessage: "Erro ao enviar imagem otimizada. Verifique sua conexão e tente novamente.",
      });

      const editedImageUrl = await uploadCustomizationAsset({
        sourceUrl: customization.editedImage,
        userId: user.id,
        fileName: `final_${ts}.jpg`,
        errorMessage: "Erro ao enviar imagem final. Verifique sua conexão e tente novamente.",
      });

      let previewImageUrl: string | null = null;
      try {
        previewImageUrl = await uploadCustomizationAsset({
          sourceUrl: customization.previewImage,
          userId: user.id,
          fileName: `preview_${ts}.png`,
          errorMessage: "Erro ao enviar imagem de preview.",
        });
      } catch {
        // non-critical
      }

      const checkoutPayload = buildCreateCheckoutPayload({
        productId: product.id,
        shippingCents: shipping.priceCents,
        eventId: initiateCheckoutEventId.current,
        addressData,
        customizationData: {
          scale: customization.scale,
          rotation: customization.rotation,
          activeFilter: customization.activeFilter,
          position: customization.position,
          preview_image_url: previewImageUrl,
        },
        rawImageUrl,
        originalImageUrl,
        editedImageUrl,
      });

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: checkoutPayload,
      });

      if (error) throw error;
      if (data?.url) {
        sessionStorage.removeItem("customization");
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente.";
      console.error("Checkout error:", msg);
      toast({ title: "Erro no checkout", description: msg, variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const productPriceCents = product?.price_cents ?? 0;
  const shippingCents = shipping?.priceCents ?? 0;

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
