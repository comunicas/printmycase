import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Truck, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormField from "@/components/ui/form-field";
import FormCard from "@/components/forms/FormCard";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { getShippingByZip, type ShippingResult } from "@/lib/shipping";
import { maskCEP } from "@/lib/masks";

interface CustomizationData {
  image: string | null;
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

  // Address form
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [addressLabel, setAddressLabel] = useState("Casa");
  const [saveAddress, setSaveAddress] = useState(false);

  // Saved addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Shipping
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  // Load saved addresses
  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAddresses(data);
        }
      });
  }, [user]);

  const handleZipChange = (value: string) => {
    const masked = maskCEP(value);
    setZipInput(masked);
    setSelectedAddressId(null);
    const clean = masked.replace(/\D/g, "");
    if (clean.length >= 2) {
      setShipping(getShippingByZip(clean));
    } else {
      setShipping(null);
    }
  };

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setNumber(addr.number);
    setComplement(addr.complement || "");
    setNeighborhood(addr.neighborhood);
    setCity(addr.city);
    setState(addr.state);
    setZipInput(maskCEP(addr.zip_code));
    setAddressLabel(addr.label);
    setShipping(getShippingByZip(addr.zip_code));
    setSaveAddress(false);
  };

  // Field errors
  const errors = useMemo(() => {
    const cleanZip = zipInput.replace(/\D/g, "");
    return {
      zip: !cleanZip ? "CEP obrigatório" : cleanZip.length < 8 ? "CEP incompleto" : (shipping && !shipping.allowed ? "Região não atendida" : ""),
      street: !street.trim() ? "Rua obrigatória" : "",
      number: !number.trim() ? "Número obrigatório" : "",
      neighborhood: !neighborhood.trim() ? "Bairro obrigatório" : "",
      city: !city.trim() ? "Cidade obrigatória" : "",
      state: !state.trim() ? "Estado obrigatório" : "",
    };
  }, [street, number, neighborhood, city, state, zipInput, shipping]);

  const isFormValid = useMemo(() => {
    return Object.values(errors).every((e) => !e);
  }, [errors]);

  const handleCheckout = async () => {
    if (!user || !product || !customization || !shipping) return;
    setSubmitted(true);
    if (!isFormValid) return;
    setCheckoutLoading(true);
    try {
      // Upload image if exists
      let imageUrl: string | null = null;
      if (customization.image) {
        const blob = await fetch(customization.image).then((r) => r.blob());
        const ext = customization.imageFileName?.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("customizations").upload(path, blob);
        if (uploadError) throw new Error("Erro ao fazer upload da imagem: " + uploadError.message);
        imageUrl = path;
      }

      const cleanZip = zipInput.replace(/\D/g, "");
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
          image_url: imageUrl,
          shipping_cents: shipping.priceCents,
          address_id: selectedAddressId,
          address_inline: selectedAddressId ? undefined : {
            street, number, complement: complement || null,
            neighborhood, city, state, zip_code: cleanZip, label: addressLabel,
          },
          save_address: !selectedAddressId && saveAddress,
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
        {customization.image && (
          <div className="flex items-center gap-4 border rounded-xl p-4 bg-card">
            <img
              src={customization.image}
              alt="Preview da customização"
              className="w-16 h-16 rounded-lg object-cover border"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{product?.name}</p>
              <p className="text-xs text-muted-foreground">Customização pronta</p>
            </div>
          </div>
        )}

        {/* Saved addresses */}
        {addresses.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Endereços salvos
            </p>
            <div className="flex flex-wrap gap-2">
              {addresses.map((addr: any) => (
                <button
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedAddressId === addr.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {addr.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedAddressId(null);
                  setStreet(""); setNumber(""); setComplement(""); setNeighborhood("");
                  setCity(""); setState(""); setZipInput(""); setAddressLabel("Casa");
                  setShipping(null); setSaveAddress(false);
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !selectedAddressId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                + Novo endereço
              </button>
            </div>
          </div>
        )}

        {/* Address form */}
        <FormCard title="Endereço de entrega" description="Preencha o endereço completo para envio.">
          <div className="space-y-4">
            <FormField label="CEP" id="zip" required error={submitted ? errors.zip : undefined}>
              <Input
                id="zip"
                placeholder="00000-000"
                value={zipInput}
                onChange={(e) => handleZipChange(e.target.value)}
                maxLength={9}
                className={`font-mono ${submitted && errors.zip ? "border-destructive" : ""}`}
              />
            </FormField>

            {shipping && (
              <p className="text-xs text-muted-foreground -mt-2">
                {shipping.region} ({shipping.state}) — {formatPrice(shipping.priceCents / 100)}
              </p>
            )}

            {shipping && !shipping.allowed && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                No momento, realizamos envios apenas para a região Sudeste (SP, RJ, MG, ES).
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Rua" id="street" required className="col-span-2" error={submitted ? errors.street : undefined}>
                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua, Av, Travessa..." className={submitted && errors.street ? "border-destructive" : ""} />
              </FormField>
              <FormField label="Número" id="number" required error={submitted ? errors.number : undefined}>
                <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" className={submitted && errors.number ? "border-destructive" : ""} />
              </FormField>
            </div>

            <FormField label="Complemento" id="complement">
              <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." />
            </FormField>

            <FormField label="Bairro" id="neighborhood" required error={submitted ? errors.neighborhood : undefined}>
              <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={submitted && errors.neighborhood ? "border-destructive" : ""} />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Cidade" id="city" required className="col-span-2" error={submitted ? errors.city : undefined}>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className={submitted && errors.city ? "border-destructive" : ""} />
              </FormField>
              <FormField label="Estado" id="state" required error={submitted ? errors.state : undefined}>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} className={`uppercase ${submitted && errors.state ? "border-destructive" : ""}`} />
              </FormField>
            </div>

            {!selectedAddressId && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="rounded border-border"
                />
                <Save className="w-3.5 h-3.5" />
                Salvar endereço para próximas compras
              </label>
            )}
          </div>
        </FormCard>

        {/* Order summary */}
        <div className="border rounded-xl p-4 bg-card space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Truck className="w-4 h-4" /> Resumo do pedido
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produto</span>
              <span>{formatPrice(productPriceCents / 100)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{shipping ? formatPrice(shippingCents / 100) : "—"}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground border-t pt-1">
              <span>Total</span>
              <span>{shipping ? formatPrice(totalCents / 100) : "—"}</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full gap-1.5"
          onClick={handleCheckout}
          disabled={checkoutLoading || !isFormValid}
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
