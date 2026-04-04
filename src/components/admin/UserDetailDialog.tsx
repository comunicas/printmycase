import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    coin_balance: number;
    order_count: number;
  } | null;
}

interface OrderRow {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  product_id: string;
  tracking_code: string | null;
}

interface GenerationRow {
  id: string;
  image_url: string;
  generation_type: string;
  filter_name: string | null;
  created_at: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const UserDetailDialog = ({ open, onClose, user }: UserDetailDialogProps) => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingGens, setLoadingGens] = useState(false);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (!open || !user) return;
    setTab("orders");
    fetchOrders(user.id);
    fetchGenerations(user.id);
  }, [open, user?.id]);

  const fetchOrders = async (userId: string) => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from("orders")
      .select("id, status, total_cents, created_at, product_id, tracking_code")
      .eq("user_id", userId)
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    setOrders(data || []);
    setLoadingOrders(false);
  };

  const fetchGenerations = async (userId: string) => {
    setLoadingGens(true);
    const { data } = await supabase
      .from("user_ai_generations")
      .select("id, image_url, generation_type, filter_name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setGenerations(data || []);
    setLoadingGens(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        {/* User header */}
        <div className="flex items-center gap-4 pb-4 border-b">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
              {user.full_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg truncate">{user.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
          </div>
          <div className="text-right text-sm space-y-1">
            <p>Cadastro: {fmtDate(user.created_at)}</p>
            <p>🪙 {user.coin_balance} coins</p>
            <p>{user.order_count} pedido(s)</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex-1">Pedidos ({orders.length})</TabsTrigger>
            <TabsTrigger value="generations" className="flex-1">Gerações IA ({generations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {loadingOrders ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado</p>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{statusLabels[o.status as keyof typeof statusLabels] || o.status}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(o.total_cents)}</p>
                      {o.tracking_code && (
                        <p className="text-xs text-muted-foreground">Rastreio: {o.tracking_code}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generations" className="mt-4">
            {loadingGens ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : generations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma geração encontrada</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {generations.map((g) => (
                  <div key={g.id} className="space-y-1">
                    <img
                      src={g.image_url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg bg-muted"
                      loading="lazy"
                    />
                    <p className="text-xs font-medium truncate">
                      {g.filter_name || g.generation_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{fmtDate(g.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;
