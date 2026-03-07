import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingCheckout, type PendingCheckoutRow } from "@/hooks/usePendingCheckout";
import { resolveProductInfo, type ProductInfo } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";

const PendingCheckoutCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchAll, remove, getSignedUrl } = usePendingCheckout();
  const [items, setItems] = useState<(PendingCheckoutRow & { productName?: string; productSlug?: string; thumbUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const rows = await fetchAll();
      if (rows.length === 0) { setLoading(false); return; }

      const productIds = rows.map(r => r.product_id);
      const infoMap = await resolveProductInfo(productIds);

      const enriched = await Promise.all(
        rows.map(async (r) => {
          const info = infoMap.get(r.product_id);
          let thumbUrl: string | null = null;
          const imgPath = r.edited_image_path || r.original_image_path;
          if (imgPath) thumbUrl = await getSignedUrl(imgPath);
          // Find slug from product info
          let slug: string | undefined;
          if (info) {
            // resolveProductInfo maps both id and slug, find the slug key
            for (const [key, val] of infoMap.entries()) {
              if (val === info && !/^[0-9a-f-]{36}$/i.test(key)) {
                slug = key;
                break;
              }
            }
          }
          return { ...r, productName: info?.name, productSlug: slug, thumbUrl: thumbUrl ?? info?.image };
        })
      );
      setItems(enriched);
      setLoading(false);
    })();
  }, []);

  const handleDiscard = async (item: typeof items[0]) => {
    setRemovingId(item.id);
    await remove(item.product_id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast({ title: "Rascunho descartado" });
    setRemovingId(null);
  };

  if (loading || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pedidos pendentes</h2>
      {items.map((item) => (
        <div key={item.id} className="border rounded-xl p-4 bg-card flex items-center gap-4">
          {item.thumbUrl && (
            <img src={item.thumbUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover border flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{item.productName ?? "Produto"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.productSlug && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => navigate(`/customize/${item.productSlug}`)}
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => navigate(`/checkout/${item.productSlug}`)}
                >
                  Continuar <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDiscard(item)}
              disabled={removingId === item.id}
            >
              {removingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingCheckoutCards;
