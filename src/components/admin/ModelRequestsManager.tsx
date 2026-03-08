import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ModelRequest {
  id: string;
  phone: string;
  model_name: string;
  created_at: string;
}

const ModelRequestsManager = () => {
  const [requests, setRequests] = useState<ModelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("model_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar solicitações", description: error.message, variant: "destructive" });
    } else {
      setRequests((data as ModelRequest[]) ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = (id: string) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget);
    const { error } = await supabase.from("model_requests").delete().eq("id", deleteTarget);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast({ title: "Solicitação excluída" });
    }
    setDeleting(null);
    setDeleteTarget(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Solicitações de Modelo</h2>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {requests.length} solicitação{requests.length !== 1 ? "ões" : ""}
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Smartphone className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p>Nenhuma solicitação recebida ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="border rounded-xl p-4 bg-card flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-medium text-foreground">{r.model_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{r.phone}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={deleting === r.id}
                onClick={() => handleDelete(r.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir esta solicitação?"
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default ModelRequestsManager;
