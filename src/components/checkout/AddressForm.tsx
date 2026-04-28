import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, MapPin, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import FormCard from "@/components/forms/FormCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getShippingByZip, type ShippingResult } from "@/lib/shipping";
import { maskCEP } from "@/lib/masks";
import { formatPrice } from "@/lib/types";
import type { Tables } from "@/integrations/supabase/types";

export interface AddressData {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipInput: string;
  addressLabel: string;
  saveAddress: boolean;
  selectedAddressId: string | null;
}

interface AddressFormProps {
  shipping: ShippingResult | null;
  onShippingChange: (s: ShippingResult | null) => void;
  submitted: boolean;
  onAddressChange: (data: AddressData, isValid: boolean) => void;
}

const AddressForm = ({ shipping, onShippingChange, submitted, onAddressChange }: AddressFormProps) => {
  const { user } = useAuth();

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [addressLabel, setAddressLabel] = useState("Casa");
  const [saveAddress, setSaveAddress] = useState(false);

  const [addresses, setAddresses] = useState<Tables<"addresses">[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

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
          handleSelectAddress(data[0]);
        }
      });
  }, [user]);

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

  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors]);

  const showError = (field: string) => (submitted || touched[field]) ? errors[field as keyof typeof errors] : undefined;
  const hasError = (field: string) => !!(submitted || touched[field]) && !!errors[field as keyof typeof errors];

  // Notify parent on any change
  const notifyParent = useCallback(() => {
    onAddressChange(
      { street, number, complement, neighborhood, city, state, zipInput, addressLabel, saveAddress, selectedAddressId },
      isValid,
    );
  }, [street, number, complement, neighborhood, city, state, zipInput, addressLabel, saveAddress, selectedAddressId, isValid, onAddressChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  const handleZipChange = async (value: string) => {
    const masked = maskCEP(value);
    setZipInput(masked);
    setSelectedAddressId(null);
    const clean = masked.replace(/\D/g, "");
    if (clean.length >= 2) {
      onShippingChange(getShippingByZip(clean));
    } else {
      onShippingChange(null);
    }

    if (clean.length === 8) {
      setZipLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "");
          setState(data.uf || "");
          if (data.complemento) setComplement(data.complemento);
        }
      } catch {
        // silently fail
      } finally {
        setZipLoading(false);
      }
    }
  };

  const handleSelectAddress = (addr: Tables<"addresses">) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setNumber(addr.number);
    setComplement(addr.complement || "");
    setNeighborhood(addr.neighborhood);
    setCity(addr.city);
    setState(addr.state);
    setZipInput(maskCEP(addr.zip_code));
    setAddressLabel(addr.label);
    onShippingChange(getShippingByZip(addr.zip_code));
    setSaveAddress(false);
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setStreet(""); setNumber(""); setComplement(""); setNeighborhood("");
    setCity(""); setState(""); setZipInput(""); setAddressLabel("Casa");
    onShippingChange(null); setSaveAddress(false);
  };

  return (
    <>
      {/* Saved addresses */}
      {addresses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Endereços salvos
          </p>
          <div className="flex flex-wrap gap-2">
            {addresses.map((addr) => (
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
              onClick={handleNewAddress}
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

      {/* Selected address summary */}
      {selectedAddressId && (
        <FormCard title="Endereço de entrega">
          <div className="text-sm text-foreground space-y-1">
            <p>{street}, {number}{complement ? ` — ${complement}` : ""}</p>
            <p>{neighborhood} — {city}/{state}</p>
            <p className="font-mono text-muted-foreground">{zipInput}</p>
            {shipping && (
              <p className="text-xs text-muted-foreground mt-2">
                {shipping.region} ({shipping.state}) — {formatPrice(shipping.priceCents / 100)}
              </p>
            )}
          </div>
        </FormCard>
      )}

      {/* Address form (only when no saved address selected) */}
      {!selectedAddressId && (
        <FormCard title="Endereço de entrega" description="Preencha o endereço completo para envio.">
          <div className="space-y-4">
            <FormField label="CEP" id="zip" required error={showError("zip")}>
              <div className="relative">
                <Input
                  id="zip"
                  placeholder="00000-000"
                  value={zipInput}
                  onChange={(e) => handleZipChange(e.target.value)}
                  onBlur={() => handleBlur("zip")}
                  maxLength={9}
                  autoComplete="postal-code"
                  className={`font-mono ${hasError("zip") ? "border-destructive" : ""}`}
                />
                {zipLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormField>

            {shipping && shipping.allowed && (
              <div className="flex items-center gap-2 -mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-xs text-green-700 font-medium">
                  ✅ Entrega disponível — {formatPrice(shipping.priceCents / 100)}
                  {shipping.deliveryDays ? ` · ${shipping.deliveryDays}` : ""}
                </span>
              </div>
            )}

            {shipping && !shipping.allowed && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                No momento, realizamos envios apenas para a região Sudeste (SP, RJ, MG, ES).
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Rua" id="street" required className="col-span-2" error={showError("street")}>
                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} onBlur={() => handleBlur("street")} placeholder="Rua, Av, Travessa..." autoComplete="street-address" className={hasError("street") ? "border-destructive" : ""} />
              </FormField>
              <FormField label="Número" id="number" required error={showError("number")}>
                <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} onBlur={() => handleBlur("number")} placeholder="123" className={hasError("number") ? "border-destructive" : ""} />
              </FormField>
            </div>

            <FormField label="Complemento" id="complement">
              <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." />
            </FormField>

            <FormField label="Bairro" id="neighborhood" required error={showError("neighborhood")}>
              <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} onBlur={() => handleBlur("neighborhood")} className={hasError("neighborhood") ? "border-destructive" : ""} />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Cidade" id="city" required className="col-span-2" error={showError("city")}>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} onBlur={() => handleBlur("city")} className={hasError("city") ? "border-destructive" : ""} />
              </FormField>
              <FormField label="Estado" id="state" required error={showError("state")}>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} onBlur={() => handleBlur("state")} placeholder="SP" maxLength={2} className={`uppercase ${hasError("state") ? "border-destructive" : ""}`} />
              </FormField>
            </div>

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
          </div>
        </FormCard>
      )}
    </>
  );
};

export default AddressForm;
