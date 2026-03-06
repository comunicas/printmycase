import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/form-field";

interface AiFilter {
  id: string;
  name: string;
  prompt: string;
  model_url: string;
  sort_order: number;
  active: boolean;
}

const MODEL_OPTIONS = [
  { value: "fal-ai/flux/dev/image-to-image", label: "Flux Dev (padrão)" },
  { value: "fal-ai/flux-pro/v1.1/image-to-image", label: "Flux Pro" },
  { value: "fal-ai/stable-diffusion-v35-large/image-to-image", label: "SD 3.5 Large" },
];

const AiFiltersManager = () => {
  const [filters, setFilters] = useState<AiFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiFilter | null>(null);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [modelUrl, setModelUrl] = useState(MODEL_OPTIONS[0].value);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("ai_filters")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar filtros", description: error.message, variant: "destructive" });
    } else {
      setFilters(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);

  const openNew = () => {
    setEditing(null);
    setName("");
    setPrompt("");
    setModelUrl(MODEL_OPTIONS[0].value);
    setDialogOpen(true);
  };

  const openEdit = (filter: AiFilter) => {
    setEditing(filter);
    setName(filter.name);
    setPrompt(filter.prompt);
    setModelUrl(filter.model_url || MODEL_OPTIONS[0].value);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !prompt.trim()) return;
    setSaving(true);

    if (editing) {
      const { error } = await (supabase as any)
        .from("ai_filters")
        .update({ name: name.trim(), prompt: prompt.trim(), model_url: modelUrl })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Filtro atualizado" });
      }
    } else {
      const maxOrder = filters.length > 0 ? Math.max(...filters.map((f) => f.sort_order)) : 0;
      const { error } = await (supabase as any)
        .from("ai_filters")
        .insert({ name: name.trim(), prompt: prompt.trim(), model_url: modelUrl, sort_order: maxOrder + 1 });
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Filtro criado" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchFilters();
  };

  const handleToggleActive = async (filter: AiFilter) => {
    const { error } = await (supabase as any)
      .from("ai_filters")
      .update({ active: !filter.active })
      .eq("id", filter.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      fetchFilters();
    }
  };

  const handleDelete = async (filter: AiFilter) => {
    if (!confirm(`Excluir "${filter.name}"?`)) return;
    const { error } = await (supabase as any).from("ai_filters").delete().eq("id", filter.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Filtro excluído" });
      fetchFilters();
    }
  };

  const handleMove = async (filter: AiFilter, direction: "up" | "down") => {
    const idx = filters.findIndex((f) => f.id === filter.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filters.length) return;

    const other = filters[swapIdx];
    await Promise.all([
      (supabase as any).from("ai_filters").update({ sort_order: other.sort_order }).eq("id", filter.id),
      (supabase as any).from("ai_filters").update({ sort_order: filter.sort_order }).eq("id", other.id),
    ]);
    fetchFilters();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Filtros IA</h1>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Filtro
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum filtro cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, idx) => (
            <div
              key={filter.id}
              className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!filter.active ? "opacity-50" : ""}`}
            >
              <div className="flex flex-col gap-0.5 mr-2">
                <button
                  onClick={() => handleMove(filter, "up")}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(filter, "down")}
                  disabled={idx === filters.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{filter.name}</p>
                <p className="text-xs text-muted-foreground truncate">{filter.prompt}</p>
                <p className="text-[10px] text-muted-foreground/60 truncate">{MODEL_OPTIONS.find(m => m.value === filter.model_url)?.label || filter.model_url}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleToggleActive(filter)} title={filter.active ? "Desativar" : "Ativar"}>
                  {filter.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(filter)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(filter)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Filtro" : "Novo Filtro"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Nome" id="filter-name" required>
              <Input
                id="filter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aquarela, Cartoon..."
              />
            </FormField>
            <FormField label="Modelo Fal.ai" id="filter-model" required>
              <select
                id="filter-model"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Prompt (enviado à IA)" id="filter-prompt" required>
              <textarea
                id="filter-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o efeito desejado para a IA..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || !prompt.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiFiltersManager;
