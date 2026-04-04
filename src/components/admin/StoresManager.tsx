import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, MapPin, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface Store {
  id: string;
  name: string;
  address: string;
  state: string;
  state_label: string;
  lat: number;
  lng: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  instagram_url: string | null;
  slug: string | null;
}

const StoresManager = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [stateLabel, setStateLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!address.trim()) {
      toast({ title: "Preencha o endereço primeiro", variant: "destructive" });
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`,
        { headers: { "User-Agent": "PrintMyCase-Admin/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(data[0].lat);
        setLng(data[0].lon);
        toast({ title: "Coordenadas encontradas" });
      } else {
        toast({ title: "Endereço não encontrado", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao buscar coordenadas", variant: "destructive" });
    } finally {
      setGeocoding(false);
    }
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("sort_order");
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setStores((data as Store[]) ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openNew = () => {
    setEditing(null);
    setName(""); setAddress(""); setState(""); setStateLabel(""); setLat(""); setLng(""); setSortOrder(0);
    setDialogOpen(true);
  };

  const openEdit = (s: Store) => {
    setEditing(s);
    setName(s.name); setAddress(s.address); setState(s.state); setStateLabel(s.state_label);
    setLat(String(s.lat)); setLng(String(s.lng)); setSortOrder(s.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim() || !state.trim() || !stateLabel.trim() || !lat || !lng) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      name: name.trim(),
      address: address.trim(),
      state: state.trim().toUpperCase(),
      state_label: stateLabel.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      sort_order: sortOrder,
    };

    if (editing) {
      const { error } = await supabase.from("stores").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Loja atualizada" });
    } else {
      const { error } = await supabase.from("stores").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Loja criada" });
    }
    setDialogOpen(false);
    fetchStores();
  };

  const handleToggleActive = async (s: Store) => {
    await supabase.from("stores").update({ active: !s.active }).eq("id", s.id);
    fetchStores();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("stores").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Loja excluída" });
    setDeleteTarget(null);
    fetchStores();
  };

  const { paginated, page, setPage, totalPages, totalItems } = usePagination(stores, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Lojas</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova Loja</Button>
      </div>

      {loading ? <LoadingSpinner /> : stores.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma loja cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {paginated.map((s) => (
            <div key={s.id} className="border rounded-xl p-4 bg-card flex items-center gap-4">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.address}</p>
                <p className="text-xs text-muted-foreground">{s.state_label} · Ordem: {s.sort_order} · ({s.lat}, {s.lng})</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleToggleActive(s)} title={s.active ? "Desativar" : "Ativar"}>
                  {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Loja" : "Nova Loja"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shopping Center 3" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Paulista, 2064 – São Paulo – SP" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estado (sigla)</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
              </div>
              <div>
                <Label>Estado (label)</Label>
                <Input value={stateLabel} onChange={(e) => setStateLabel(e.target.value)} placeholder="São Paulo (SP)" />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-23.5558" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-46.6621" />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleGeocode} disabled={geocoding} title="Buscar coordenadas pelo endereço">
                {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
            <Button className="w-full" onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir loja?"
        description={`"${deleteTarget?.name}" será excluída permanentemente.`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
};

export default StoresManager;
