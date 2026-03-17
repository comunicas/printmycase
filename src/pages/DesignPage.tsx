import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useDesign } from "@/hooks/useCollections";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/types";
import { type ShippingResult } from "@/lib/shipping";
import { generateEventId } from "@/lib/meta-pixel";
import AddressForm, { type AddressData } from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentBadges from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";


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
  const initiateCheckoutEventId = useRef(generateEventId());

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
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
              <img
                src={design.image_url}
                alt={design.name}
                className="w-full h-full object-cover"
              />
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
    </div>
  );
};

export default DesignPage;
