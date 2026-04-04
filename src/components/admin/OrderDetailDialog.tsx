import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrderImagesPreviewer from "@/components/admin/OrderImagesPreviewer";
import { statusLabels, statusFlow, statusIcons, getStepIndex } from "@/lib/constants";
import { formatPrice } from "@/lib/types";
import type { Database } from "@/integrations/supabase/types";

interface OrderRow {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  design_id?: string | null;
  design_name?: string;
  design_image?: string;
  customer_name?: string;
  customer_city?: string;
  customer_state?: string;
  status: Database["public"]["Enums"]["order_status"];
  total_cents: number;
  shipping_cents?: number | null;
  tracking_code?: string | null;
  shipping_address?: any;
  customization_data?: any;
  created_at: string;
  rejection_reason?: string | null;
}

interface Props {
  order: OrderRow | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string, rejectionReason?: string) => Promise<void>;
  onSaveTracking: (orderId: string, code: string) => Promise<void>;
}

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-yellow-100 text-yellow-800 border-yellow-300",
  analyzing: "bg-blue-100 text-blue-800 border-blue-300",
  rejected: "bg-orange-100 text-orange-800 border-orange-300",
  producing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const OrderDetailDialog = ({ order, open, onClose, onStatusChange, onSaveTracking }: Props) => {
  const [trackingInput, setTrackingInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // Reset reject form when order changes
  useEffect(() => {
    setShowRejectForm(false);
    setRejectionReason("");
  }, [order?.id]);

  if (!order) return null;

  const shipping = order.shipping_address as Record<string, any> | null;
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const isRejected = order.status === "rejected";

  const handleSave = async () => {
    if (!trackingInput.trim()) return;
    setSaving(true);
    await onSaveTracking(order.id, trackingInput.trim());
    setSaving(false);
  };

  const handleStatusSelect = (newStatus: string) => {
    if (newStatus === "rejected") {
      setShowRejectForm(true);
      setRejectionReason("");
    } else {
      setShowRejectForm(false);
      onStatusChange(order.id, newStatus);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    setSubmittingReject(true);
    await onStatusChange(order.id, "rejected", rejectionReason.trim());
    setShowRejectForm(false);
    setRejectionReason("");
    setSubmittingReject(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {order.design_image || order.product_image ? (
              <img
                src={order.design_image || order.product_image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-base font-semibold truncate">
                {order.design_name ? `${order.design_name} — ${order.product_name}` : (order.product_name ?? order.product_id)}
              </p>
              <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
            </div>
            <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${statusColorMap[order.status] || ""}`}>
              {statusLabels[order.status]}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Progresso</h4>
            <div className="flex items-center gap-1">
              {statusFlow.map((s, i) => {
                const Icon = statusIcons[s];
                const isActive = !isCancelled && !isRejected && i <= currentStep;
                const isCurrent = !isCancelled && !isRejected && i === currentStep;
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent ? "bg-primary text-primary-foreground" :
                        isActive ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] text-center leading-tight ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {statusLabels[s]}
                      </span>
                    </div>
                    {i < statusFlow.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded ${isActive && i < currentStep ? "bg-primary/40" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {isCancelled && (
              <p className="text-xs text-red-600 font-medium mt-2">Pedido cancelado</p>
            )}
            {isRejected && (
              <div className="mt-2">
                <p className="text-xs text-orange-600 font-medium">Imagem recusada pelo administrador</p>
                {order.rejection_reason && (
                  <div className="mt-1.5 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium mb-0.5">Motivo:</p>
                    <p className="text-sm text-orange-900">{order.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cliente */}
          {order.customer_name && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Cliente</h4>
              <p className="text-sm text-muted-foreground">
                {order.customer_name}
                {order.customer_city && ` · ${order.customer_city}/${order.customer_state}`}
              </p>
            </div>
          )}

          {/* Endereço */}
          {shipping && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Endereço de Entrega</h4>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>{shipping.street}{shipping.number ? `, ${shipping.number}` : ""}{shipping.complement ? ` — ${shipping.complement}` : ""}</p>
                <p>{shipping.neighborhood}{shipping.neighborhood && shipping.city ? ", " : ""}{shipping.city}/{shipping.state}</p>
                {shipping.zip_code && <p>CEP: {shipping.zip_code}</p>}
              </div>
            </div>
          )}

          {/* Valores */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Valores</h4>
            <div className="text-sm space-y-0.5">
              {order.shipping_cents != null && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Produto</span>
                    <span>{formatPrice((order.total_cents - order.shipping_cents) / 100)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>{formatPrice(order.shipping_cents / 100)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPrice(order.total_cents / 100)}</span>
              </div>
            </div>
          </div>

          {/* Status + Rastreio */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Status e Rastreio</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Status:</label>
                <select
                  value={showRejectForm ? "rejected" : order.status}
                  onChange={(e) => handleStatusSelect(e.target.value)}
                  className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
                >
                  {Object.entries(statusLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  placeholder="Código de rastreio"
                  value={trackingInput || order.tracking_code || ""}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="text-sm font-mono h-8"
                />
                <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || !(trackingInput || "").trim()}>
                  Salvar
                </Button>
              </div>
            </div>

            {/* Reject form */}
            {showRejectForm && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                <p className="text-sm font-medium text-orange-800">Justificativa para recusa (obrigatório)</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Descreva o motivo da recusa da imagem..."
                  className="w-full min-h-[80px] p-2 border border-orange-300 rounded-md text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowRejectForm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!rejectionReason.trim() || submittingReject}
                    onClick={handleConfirmReject}
                  >
                    {submittingReject ? "Salvando..." : "Confirmar Recusa"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Data */}
          <div>
            <p className="text-xs text-muted-foreground">
              Criado em {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Imagens */}
          <OrderImagesPreviewer customizationData={order.customization_data ?? null} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
