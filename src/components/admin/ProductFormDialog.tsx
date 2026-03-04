import { useState, FormEvent, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import DeviceImageUpload from "@/components/admin/DeviceImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

const ProductFormDialog = ({ open, onOpenChange, product, onSaved }: Props) => {
  const isEditing = !!product;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceReais, setPriceReais] = useState("");
  const [imagesRaw, setImagesRaw] = useState("");
  const [deviceImage, setDeviceImage] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description ?? "");
      setPriceReais((product.price_cents / 100).toFixed(2).replace(".", ","));
      setImagesRaw(product.images?.join("\n") ?? "");
      setDeviceImage(product.device_image ?? "");
      setActive(product.active);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setPriceReais("");
      setImagesRaw("");
      setDeviceImage("");
      setActive(true);
    }
  }, [product, open]);

  const generateSlug = (val: string) =>
    val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const parseCents = (val: string): number => {
    const cleaned = val.replace(/[^\d,\.]/g, "").replace(",", ".");
    return Math.round(parseFloat(cleaned) * 100);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const priceCents = parseCents(priceReais);
    if (isNaN(priceCents) || priceCents <= 0) {
      toast({ title: "Preço inválido", variant: "destructive" });
      setSaving(false);
      return;
    }

    const images = imagesRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isEditing) {
        const priceChanged = priceCents !== product.price_cents;

        const { error } = await supabase
          .from("products")
          .update({ name, slug, description, price_cents: priceCents, images, active, device_image: deviceImage || null })
          .eq("id", product.id);
        if (error) throw error;

        // Sync with Stripe if price changed
        if (priceChanged && product.stripe_product_id) {
          await supabase.functions.invoke("admin-sync-stripe", {
            body: { action: "update_price", product_id: product.id },
          });
        } else if (!product.stripe_product_id) {
          // Create on Stripe if not yet synced
          await supabase.functions.invoke("admin-sync-stripe", {
            body: { action: "create", product_id: product.id },
          });
        }

        toast({ title: "Produto atualizado!" });
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({ name, slug, description, price_cents: priceCents, images, active, device_image: deviceImage || null })
          .select("id")
          .single();
        if (error) throw error;

        // Create on Stripe
        await supabase.functions.invoke("admin-sync-stripe", {
          body: { action: "create", product_id: data.id },
        });

        toast({ title: "Produto criado!" });
      }

      onSaved();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Altere os dados do produto e salve." : "Preencha os dados para criar um novo produto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome" id="pName" required>
            <Input
              id="pName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEditing) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Capa iPhone 16 Pro Max"
              required
            />
          </FormField>

          <FormField label="Slug" id="pSlug" required hint="Identificador único na URL">
            <Input
              id="pSlug"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="capa-iphone-16-pro-max"
              required
            />
          </FormField>

          <FormField label="Descrição" id="pDesc">
            <textarea
              id="pDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Descrição do produto..."
            />
          </FormField>

          <FormField label="Preço (R$)" id="pPrice" required>
            <Input
              id="pPrice"
              value={priceReais}
              onChange={(e) => setPriceReais(e.target.value)}
              placeholder="69,90"
              required
            />
          </FormField>

          <FormField label="Imagens (URLs, uma por linha)" id="pImages">
            <textarea
              id="pImages"
              value={imagesRaw}
              onChange={(e) => setImagesRaw(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="https://..."
            />
          </FormField>

          <FormField label="Imagem do Aparelho" id="pDeviceImage" hint="Foto de referência do celular sem capa">
            <DeviceImageUpload
              productId={product?.id ?? null}
              value={deviceImage}
              onChange={setDeviceImage}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="pActive" className="text-sm">Produto ativo</label>
          </div>

          <SubmitButton loading={saving} className="w-full">
            {isEditing ? "Salvar alterações" : "Criar produto"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
