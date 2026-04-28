import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Pencil, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import JourneyProgress from "@/components/JourneyProgress";
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
import { generateEventId, pixelTrackInitiateCheckout } from "@/lib/meta-pixel";
import { parsePendingCustomizationData } from "@/types/customization";
import LoginDialog from "@/components/customize/LoginDialog";
import { ProfileCompletion } from "@/components/checkout/ProfileCompletion";

interface CustomizationData {
  rawImage: string | null;
  image: string | null;
  editedImage: string | null;
  previewImage: string | null;
  imageFileName: string | null;
  scale: number;
  rotation: number;
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
  const [showLoginDialog, setShowLoginDialog] = useState(!user);

  useEffect(() => {
    if (!user && !productLoading) {
      setShowLoginDialog(true);
    } else if (user) {
      setShowLoginDialog(false);
    }
  }, [user, productLoading]);

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
      initiateCheckoutEventId.current = pixelTrackInitiateCheckout(
        product.price_cents / 100,
        product.id,
        initiateCheckoutEventId.current,
      );
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
        const cd = parsePendingCustomizationData(pending.customization_data);
        let imgUrl: string | null = null;
        let editedUrl: string | null = null;
        if (pending.edited_image_path) editedUrl = await getSignedUrl(pending.edited_image_path);
        if (pending.original_image_path) imgUrl = await getSignedUrl(pending.original_image_path);
        // Restore preview image from storage if available
        let previewUrl: string | null = null;
        if (cd.previewImagePath) {
          previewUrl = await getSignedUrl(cd.previewImagePath);
        }
        setCustomization({
          rawImage: imgUrl,
          image: imgUrl,
          editedImage: editedUrl,
          previewImage: previewUrl,
          imageFileName: null,
          scale: cd.scale ?? 100,
          rotation: cd.rotation ?? 0,
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

      const fetchWithTimeout = async (url: string, timeoutMs = 15000): Promise<Blob> => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw new Error(`Fetch falhou: ${res.status}`);
          return await res.blob();
        } finally {
          clearTimeout(timer);
        }
      };

      // Upload raw image (original user upload, untouched)
      try {
        const rawSrc = customization.rawImage || customization.image;
        if (rawSrc) {
          const blob = await fetchWithTimeout(rawSrc);
          const ext = customization.imageFileName?.split(".").pop() || "png";
          const path = `${user.id}/original_${ts}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
          if (uploadError) throw uploadError;
          rawImageUrl = path;
        }
      } catch {
        throw new Error("Erro ao enviar imagem original. Verifique sua conexão e tente novamente.");
      }

      // Upload optimized image (after filters/upscale, max quality)
      try {
        if (customization.image) {
          const blob = await fetchWithTimeout(customization.image);
          const path = `${user.id}/optimized_${ts}.jpg`;
          const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
          if (uploadError) throw uploadError;
          originalImageUrl = path;
        }
      } catch {
        throw new Error("Erro ao enviar imagem otimizada. Verifique sua conexão e tente novamente.");
      }

      // Upload final image (snapshot with frame positioning)
      try {
        if (customization.editedImage) {
          const blob = await fetchWithTimeout(customization.editedImage);
          const path = `${user.id}/final_${ts}.jpg`;
          const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
          if (uploadError) throw uploadError;
          editedImageUrl = path;
        }
      } catch {
        throw new Error("Erro ao enviar imagem final. Verifique sua conexão e tente novamente.");
      }

      // Upload preview image (mockup with device frame)
      let previewImageUrl: string | null = null;
      try {
        if (customization.previewImage) {
          const blob = await fetchWithTimeout(customization.previewImage);
          const path = `${user.id}/preview_${ts}.png`;
          const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
          if (!uploadError) previewImageUrl = path;
        }
      } catch { /* non-critical */ }

      const cleanZip = addressData.zipInput.replace(/\D/g, "");
      const customizationPayload = {
        scale: customization.scale,
        rotation: customization.rotation,
        activeFilter: customization.activeFilter,
        position: customization.position,
        preview_image_url: previewImageUrl,
      };

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product_id: product.id,
          customization_data: customizationPayload,
          raw_image_url: rawImageUrl,
          original_image_url: originalImageUrl,
          edited_image_url: editedImageUrl,
          shipping_cents: shipping.priceCents,
          initiate_checkout_event_id: initiateCheckoutEventId.current,
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
  const totalCents = productPriceCents + shippingCents;

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    ...(product ? [{ label: product.name, to: `/product/${product.slug}` }] : []),
    ...(product ? [{ label: "Customizar", to: `/customize/${product.slug}` }] : []),
    { label: "Checkout" },
  ];

  if (productLoading || (user && (!customization || recovering))) {
    return (
      <>
        <LoadingSpinner variant="fullPage" />
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          reason="checkout"
          redirectUrl={typeof window !== "undefined" ? window.location.href : undefined}
        />
      </>
    );
  }

  if (!user || !customization) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader breadcrumbs={breadcrumbs} />
        <JourneyProgress currentStep={3} />
        <main className="flex-1 max-w-xl mx-auto w-full p-5 lg:p-10" />
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          reason="checkout"
          redirectUrl={typeof window !== "undefined" ? window.location.href : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <JourneyProgress currentStep={3} />
      <main className="flex-1 max-w-xl mx-auto w-full p-5 lg:p-10 space-y-6 pb-28 lg:pb-10">

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

        {/* Métodos de pagamento aceitos */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Forma de pagamento</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white text-xs font-bold">PIX</div>
              <div>
                <p className="text-sm font-medium text-green-800">Pix — aprovação imediata</p>
                <p className="text-xs text-green-600">Pague com QR Code ou copia e cola</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Cartão de crédito</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Elo, Amex</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            🔒 Pagamento processado com segurança via Stripe
          </p>
        </div>

        <Button
          className="hidden lg:flex w-full gap-1.5"
          onClick={handleCheckout}
          disabled={checkoutLoading || !isAddressValid}
        >
          {checkoutLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Ir para pagamento <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>

        <Link to="/contato" className="hidden lg:block text-center text-sm text-primary hover:text-primary/80 transition-colors">
          Precisando de ajuda? Fale Conosco
        </Link>

        <PaymentBadges />
      </main>

      {/* Mobile sticky checkout bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-base font-semibold text-foreground">
                {(totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              {shipping?.deliveryDays && (
                <span className="text-[10px] text-muted-foreground">{shipping.deliveryDays}</span>
              )}
            </div>
            <Button
              className="flex-1 gap-1.5"
              onClick={handleCheckout}
              disabled={checkoutLoading || !isAddressValid}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Ir para pagamento <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
          <Link to="/contato" className="block text-center text-sm text-primary hover:text-primary/80 transition-colors">
            Precisando de ajuda? Fale Conosco
          </Link>
        </div>
      </div>
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        reason="checkout"
        redirectUrl={typeof window !== "undefined" ? window.location.href : undefined}
      />
    </div>
  );
};

export default Checkout;
