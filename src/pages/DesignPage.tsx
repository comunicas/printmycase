import { useState, useEffect, useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useDesign } from "@/hooks/useCollections";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/types";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import { type ShippingResult } from "@/lib/shipping";
import { generateEventId } from "@/lib/meta-pixel";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentBadges from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
const SITE_NAME = "PrintMyCase";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";

const DesignPage = () => {
  const { collectionSlug, designSlug } = useParams<{ collectionSlug: string; designSlug: string }>();
  const { design, loading: designLoading } = useDesign(designSlug);
  const { products, loading: productsLoading } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const initiateCheckoutEventId = useRef(generateEventId());

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (!showZoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowZoom(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showZoom]);

  // Auto-select first product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const handleAddressChange = useCallback((data: AddressData, valid: boolean) => {
    setAddressData(data);
    setIsAddressValid(valid);
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/colecao/${collectionSlug}/${designSlug}` } });
      return;
    }
    if (!design || !selectedProductId || !addressData || !shipping) return;
    setSubmitted(true);
    if (!isAddressValid) return;

    setCheckoutLoading(true);
    try {
      const cleanZip = addressData.zipInput.replace(/\D/g, "");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product_id: selectedProductId,
          design_id: design.id,
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
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err: any) {
      toast({ title: "Erro no checkout", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    if (!design) return;
    const title = `${design.name} | ${SITE_NAME}`;
    const desc = `Capa com design "${design.name}" — ${formatPrice(design.price_cents / 100)}. Escolha seu modelo e finalize!`;
    const image = design.image_url;
    const url = `${SITE_URL}/colecao/${collectionSlug}/${designSlug}`;
    document.title = title;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "product");
    setMeta("property", "product:price:amount", String(design.price_cents / 100));
    setMeta("property", "product:price:currency", "BRL");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", url);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: design.name,
      image,
      url,
      description: desc,
      sku: design.slug,
      category: "Capas para Celular",
      brand: BRAND,
      offers: merchantOffer(design.price_cents / 100, url),
    };
    let script = document.querySelector('script[data-seo="design-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo", "design-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); canonical?.remove(); };
  }, [design, collectionSlug, designSlug]);

  if (designLoading || productsLoading) return <LoadingSpinner variant="fullPage" />;

  if (!design) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader breadcrumbs={[{ label: "Coleções", to: "/colecoes" }, { label: "Design não encontrado" }]} />
        <main className="max-w-5xl mx-auto px-5 py-16 text-center">
          <p className="text-muted-foreground">Design não encontrado.</p>
        </main>
      </div>
    );
  }

  const shippingCents = shipping?.priceCents ?? 0;

  const breadcrumbs = [
    { label: "Coleções", to: "/colecoes" },
    { label: collectionSlug || "", to: `/colecao/${collectionSlug}` },
    { label: design.name },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 max-w-4xl mx-auto w-full p-5 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Design preview */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
              <img
                src={design.image_url}
                alt={design.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-zoom-in flex-shrink-0"
                onMouseEnter={() => setShowZoom(true)}
                onClick={() => setShowZoom((v) => !v)}
              >
                <img
                  src={design.image_url}
                  alt={`${design.name} — ampliar`}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Passe o mouse para ampliar
              </span>
              <span className="text-xs text-muted-foreground sm:hidden">
                Toque para ampliar
              </span>
            </div>
          </div>

          {/* Purchase section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{design.name}</h1>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatPrice(design.price_cents / 100)}
              </p>
            </div>

            {/* Model selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Escolha o modelo do seu celular
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <AddressForm
              shipping={shipping}
              onShippingChange={setShipping}
              submitted={submitted}
              onAddressChange={handleAddressChange}
            />

            <OrderSummary
              productPriceCents={design.price_cents}
              shippingCents={shippingCents}
              hasShipping={!!shipping}
              aiFilterApplied={false}
            />

            <Button
              className="w-full gap-1.5"
              onClick={handleCheckout}
              disabled={checkoutLoading || !selectedProductId || !isAddressValid}
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Finalizar Pedido <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>

            <PaymentBadges />
          </div>
        </div>
      </main>

      {showZoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowZoom(false)}
          onMouseLeave={() => setShowZoom(false)}
        >
          <img
            src={design.image_url}
            alt={design.name}
            className="max-w-3xl max-h-[90vh] w-full object-contain rounded-lg shadow-2xl"
            onClick={(e: ReactMouseEvent) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DesignPage;
