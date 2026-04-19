import { useState, useEffect, useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useDesign, useCollection } from "@/hooks/useCollections";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/types";
import { BRAND, merchantOffer, defaultAggregateRating } from "@/lib/merchant-jsonld";
import { setPageSeo, setMeta, SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { type ShippingResult } from "@/lib/shipping";
import { generateEventId, pixelEvent } from "@/lib/meta-pixel";
import { clarityEvent } from "@/lib/clarity";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentBadges from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
const SITE_NAME = "Studio PrintMyCase";

const DesignPage = () => {
  const { collectionSlug, designSlug } = useParams<{ collectionSlug: string; designSlug: string }>();
  const { design, loading: designLoading } = useDesign(designSlug);
  const { collection } = useCollection(collectionSlug);
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
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const initiateCheckoutEventId = useRef(generateEventId());

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const allDesignImages = design ? [design.image_url, ...(design.images ?? [])].filter(Boolean) : [];
  const currentImage = allDesignImages[selectedImageIdx] ?? design?.image_url ?? "";

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

    const cleanup = setPageSeo({ title, description: desc, url, image, type: "product" });
    setMeta("property", "product:price:amount", String(design.price_cents / 100));
    setMeta("property", "product:price:currency", "BRL");

    const allImgs = [design.image_url, ...(design.images ?? [])].filter(Boolean);
    const productDesc = design.description || desc;
    const jsonLd = {
      "@context": "https://schema.org",
      inLanguage: "pt-BR",
      "@graph": [
        {
          "@type": "Product",
          name: design.name,
          image: allImgs.length > 1 ? allImgs : image,
          url,
          description: productDesc,
          sku: design.slug,
          category: "Capas para Celular",
          inLanguage: "pt-BR",
          brand: BRAND,
          offers: merchantOffer(design.price_cents / 100, url),
          aggregateRating: defaultAggregateRating(),
        },
        breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Coleções", url: `${SITE_URL}/colecoes` },
          { name: collection?.name || collectionSlug || "", url: `${SITE_URL}/colecao/${collectionSlug}` },
          { name: design.name },
        ]),
      ],
    };
    let script = document.querySelector('script[data-seo="design-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo", "design-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); cleanup(); };
  }, [design, collectionSlug, designSlug]);

  // Tracking: ViewContent (Pixel) + Clarity event, once per design
  useEffect(() => {
    if (!design?.id) return;
    clarityEvent("design_view");
    pixelEvent(
      "ViewContent",
      {
        content_name: design.name,
        content_ids: [design.id],
        content_type: "product",
        value: design.price_cents / 100,
        currency: "BRL",
      },
      generateEventId()
    );
  }, [design?.id]);

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
    { label: collection?.name || collectionSlug || "", to: `/colecao/${collectionSlug}` },
    { label: design.name },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 max-w-4xl mx-auto w-full p-5 lg:p-10 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Design preview */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
              <img
                src={currentImage}
                alt={`${design.name} ${selectedImageIdx > 0 ? `- foto ${selectedImageIdx + 1}` : ""}`}
                width={600}
                height={600}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => { setZoomImage(currentImage); setShowZoom(true); }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            {allDesignImages.length > 1 ? (
              <div className="flex gap-2 flex-wrap">
                {allDesignImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      i === selectedImageIdx ? "border-primary" : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <img src={img} alt={`${design.name} — miniatura ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Clique na imagem para ampliar</p>
            )}
          </div>

          {/* Purchase section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{design.name}</h1>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatPrice(design.price_cents / 100)}
              </p>
              {design.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h2 className="text-sm font-semibold text-foreground mb-2">Descrição</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{design.description}</p>
                </div>
              )}
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

            {/* Device image preview */}
            {selectedProduct?.device_image && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Seu modelo:</p>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/50 cursor-zoom-in"
                  onClick={() => { setZoomImage(selectedProduct.device_image!); setShowZoom(true); }}
                >
                  <img
                    src={selectedProduct.device_image}
                    alt={selectedProduct.name}
                    width={120}
                    height={120}
                    className="max-h-[120px] object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{selectedProduct.name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Clique para ampliar</span>
                    <span className="text-xs text-muted-foreground sm:hidden">Toque para ampliar</span>
                  </div>
                </div>
              </div>
            )}

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
              className="w-full gap-1.5 hidden lg:flex"
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

      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-base font-semibold text-foreground">
              {formatPrice((design.price_cents + shippingCents) / 100)}
            </span>
          </div>
          <Button
            className="flex-1 gap-1.5"
            onClick={handleCheckout}
            disabled={checkoutLoading || !selectedProductId || !isAddressValid}
          >
            {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalizar <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </div>

      {showZoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-zoom-backdrop"
          onClick={() => setShowZoom(false)}
        >
          <img
              src={zoomImage}
              alt="Ampliar"
              className="max-w-3xl max-h-[90vh] w-full object-contain rounded-lg shadow-2xl animate-zoom-img"
              onClick={(e: ReactMouseEvent) => e.stopPropagation()}
            />
        </div>
      )}
    </div>
  );
};

export default DesignPage;
