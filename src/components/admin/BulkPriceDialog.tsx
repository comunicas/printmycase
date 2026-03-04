import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

const fmt = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  adjustType: "fixed" | "percent";
  adjustValue: number; // cents for fixed, whole number for percent
  direction: "increase" | "decrease";
  onDone: () => void;
}

function calcNewPrice(current: number, type: "fixed" | "percent", value: number, dir: "increase" | "decrease") {
  if (type === "fixed") {
    return dir === "increase" ? current + value : Math.max(0, current - value);
  }
  const factor = dir === "increase" ? 1 + value / 100 : 1 - value / 100;
  return Math.max(0, Math.round(current * factor));
}

const BATCH_SIZE = 5;

const BulkPriceDialog = ({ open, onOpenChange, products, adjustType, adjustValue, direction, onDone }: Props) => {
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; phase: string } | null>(null);
  const { toast } = useToast();

  const previews = products.map((p) => ({
    ...p,
    newPrice: calcNewPrice(p.price_cents, adjustType, adjustValue, direction),
  }));

  const processBatches = async <T,>(items: T[], fn: (item: T) => Promise<boolean>, phase: string) => {
    let errors = 0;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(fn));
      errors += results.filter((ok) => !ok).length;
      setProgress({ current: Math.min(i + BATCH_SIZE, items.length), total: items.length, phase });
    }
    return errors;
  };

  const handleApply = async () => {
    setApplying(true);

    // Phase 1: DB updates
    const dbErrors = await processBatches(previews, async (item) => {
      const { error } = await supabase
        .from("products")
        .update({ price_cents: item.newPrice })
        .eq("id", item.id);
      return !error;
    }, "Atualizando banco de dados");

    // Phase 2: Stripe sync
    const stripeItems = previews.filter((p) => p.stripe_product_id);
    if (stripeItems.length > 0) {
      await processBatches(stripeItems, async (item) => {
        const { error } = await supabase.functions.invoke("admin-sync-stripe", {
          body: { action: "update_price", product_id: item.id },
        });
        return !error;
      }, "Sincronizando pagamentos");
    }

    if (dbErrors > 0) {
      toast({ title: `${previews.length - dbErrors} atualizados, ${dbErrors} erros`, variant: "destructive" });
    } else {
      toast({ title: `${previews.length} preços atualizados com sucesso` });
    }

    setApplying(false);
    setProgress(null);
    onOpenChange(false);
    onDone();
  };

  const label = direction === "increase" ? "Aumentar" : "Diminuir";
  const suffix = adjustType === "fixed" ? fmt(adjustValue) : `${adjustValue}%`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirmar alteração de preços</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {label} {suffix} em {previews.length} produto{previews.length > 1 ? "s" : ""}:
        </p>

        <div className="overflow-y-auto flex-1 space-y-1.5 my-2">
          {previews.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
              <span className="truncate mr-3 font-medium">{p.name}</span>
              <span className="whitespace-nowrap">
                <span className="text-muted-foreground line-through mr-2">{fmt(p.price_cents)}</span>
                <span className="font-semibold text-foreground">{fmt(p.newPrice)}</span>
              </span>
            </div>
          ))}
        </div>

        {progress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.phase}</span>
              <span>{progress.current} de {progress.total}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={applying}>
            {applying ? "Aplicando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPriceDialog;
