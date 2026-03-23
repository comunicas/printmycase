import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
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
  style_image_url: string | null;
  send_style_image: boolean;
  preview_css: string | null;
}

const MODEL_OPTIONS = [
  { value: "fal-ai/flux/dev/image-to-image", label: "Flux Dev (padrão)" },
  { value: "fal-ai/flux-pro/kontext", label: "Flux Pro Kontext" },
  { value: "fal-ai/stable-diffusion-v35-large/image-to-image", label: "SD 3.5 Large" },
  { value: "fal-ai/image-apps-v2/style-transfer", label: "Style Transfer" },
  { value: "fal-ai/image-apps-v2/photography-effects", label: "Photography Effects" },
  { value: "fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration", label: "Lighting Restoration" },
];

const STYLE_OPTIONS = [
  { value: "impressionist", label: "Impressionista" },
  { value: "anime_character", label: "Anime Character" },
  { value: "cartoon_3d", label: "Cartoon 3D" },
  { value: "hand_drawn_animation", label: "Hand Drawn Animation" },
  { value: "cyberpunk_future", label: "Cyberpunk Future" },
  { value: "anime_game_style", label: "Anime Game Style" },
  { value: "comic_book_animation", label: "Comic Book Animation" },
  { value: "animated_series", label: "Animated Series" },
  { value: "cartoon_animation", label: "Cartoon Animation" },
  { value: "lofi_aesthetic", label: "Lo-Fi Aesthetic" },
  { value: "cottagecore", label: "Cottagecore" },
  { value: "dark_academia", label: "Dark Academia" },
  { value: "y2k", label: "Y2K" },
  { value: "vaporwave", label: "Vaporwave" },
  { value: "liminal_space", label: "Liminal Space" },
  { value: "weirdcore", label: "Weirdcore" },
  { value: "dreamcore", label: "Dreamcore" },
  { value: "synthwave", label: "Synthwave" },
  { value: "outrun", label: "Outrun" },
  { value: "photorealistic", label: "Photorealistic" },
  { value: "hyperrealistic", label: "Hyperrealistic" },
  { value: "digital_art", label: "Digital Art" },
  { value: "concept_art", label: "Concept Art" },
  { value: "anime", label: "Anime" },
  { value: "pixel_art", label: "Pixel Art" },
  { value: "claymation", label: "Claymation" },
];

const EFFECT_OPTIONS = [
  { value: "film", label: "Film" },
  { value: "vintage_film", label: "Vintage Film" },
  { value: "portrait_photography", label: "Portrait Photography" },
  { value: "fashion_photography", label: "Fashion Photography" },
  { value: "street_photography", label: "Street Photography" },
  { value: "sepia_tone", label: "Sepia Tone" },
  { value: "film_grain", label: "Film Grain" },
  { value: "light_leaks", label: "Light Leaks" },
  { value: "vignette_effect", label: "Vignette Effect" },
  { value: "instant_camera", label: "Instant Camera" },
  { value: "golden_hour", label: "Golden Hour" },
  { value: "dramatic_lighting", label: "Dramatic Lighting" },
  { value: "soft_focus", label: "Soft Focus" },
  { value: "bokeh_effect", label: "Bokeh Effect" },
  { value: "high_contrast", label: "High Contrast" },
  { value: "double_exposure", label: "Double Exposure" },
];

const StyleImageUpload = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `ai-filters/${crypto.randomUUID()}/style.${ext}`;
    setUploading(true);
    try {
      const { error } = await supabase.storage.from("product-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-assets").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Referência" className="h-24 w-auto rounded-md border border-border object-contain" />
          <button type="button" onClick={() => onChange("")} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:opacity-80">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
          {uploading ? <p className="text-sm">Enviando...</p> : <><ImageIcon className="h-5 w-5" /><p className="text-xs">Clique para enviar imagem de referência</p></>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
};

const AiFiltersManager = () => {
  const [filters, setFilters] = useState<AiFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiFilter | null>(null);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [modelUrl, setModelUrl] = useState(MODEL_OPTIONS[0].value);
  const [styleImageUrl, setStyleImageUrl] = useState("");
  const [sendStyleImage, setSendStyleImage] = useState(true);
  const [previewCss, setPreviewCss] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AiFilter | null>(null);
  const { toast } = useToast();

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
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

  const isStyleTransfer = modelUrl === "fal-ai/image-apps-v2/style-transfer";
  const isPhotographyEffects = modelUrl === "fal-ai/image-apps-v2/photography-effects";
  const isLightingRestoration = modelUrl === "fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration";
  const noPromptNeeded = isLightingRestoration;

  const openNew = () => {
    setEditing(null); setName(""); setPrompt(""); setModelUrl(MODEL_OPTIONS[0].value); setStyleImageUrl(""); setSendStyleImage(true); setPreviewCss(""); setDialogOpen(true);
  };

  const openEdit = (filter: AiFilter) => {
    setEditing(filter); setName(filter.name); setPrompt(filter.prompt); setModelUrl(filter.model_url || MODEL_OPTIONS[0].value); setStyleImageUrl(filter.style_image_url || ""); setSendStyleImage(filter.send_style_image ?? true); setPreviewCss(filter.preview_css || ""); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || (!noPromptNeeded && !prompt.trim())) return;
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("ai_filters")
        .update({ name: name.trim(), prompt: noPromptNeeded ? "auto" : prompt.trim(), model_url: modelUrl, style_image_url: styleImageUrl || null, send_style_image: sendStyleImage, preview_css: previewCss.trim() || null })
        .eq("id", editing.id);
      if (error) toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      else toast({ title: "Filtro atualizado" });
    } else {
      const maxOrder = filters.length > 0 ? Math.max(...filters.map((f) => f.sort_order)) : 0;
      const { error } = await supabase
        .from("ai_filters")
        .insert({ name: name.trim(), prompt: noPromptNeeded ? "auto" : prompt.trim(), model_url: modelUrl, style_image_url: styleImageUrl || null, send_style_image: sendStyleImage, sort_order: maxOrder + 1, preview_css: previewCss.trim() || null });
      if (error) toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      else toast({ title: "Filtro criado" });
    }

    setSaving(false); setDialogOpen(false); fetchFilters();
  };

  const handleToggleActive = async (filter: AiFilter) => {
    const { error } = await supabase.from("ai_filters").update({ active: !filter.active }).eq("id", filter.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchFilters();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("ai_filters").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else { toast({ title: "Filtro excluído" }); fetchFilters(); }
    setDeleteTarget(null);
  };

  const handleMove = async (filter: AiFilter, direction: "up" | "down") => {
    const idx = filters.findIndex((f) => f.id === filter.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filters.length) return;
    const other = filters[swapIdx];
    await Promise.all([
      supabase.from("ai_filters").update({ sort_order: other.sort_order }).eq("id", filter.id),
      supabase.from("ai_filters").update({ sort_order: filter.sort_order }).eq("id", other.id),
    ]);
    fetchFilters();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Filtros IA</h2>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Filtro
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum filtro cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, idx) => (
            <div key={filter.id} className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!filter.active ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5 mr-2">
                <button onClick={() => handleMove(filter, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(filter, "down")} disabled={idx === filters.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              {filter.style_image_url && <img src={filter.style_image_url} alt="Ref" className="h-12 w-12 rounded-md border border-border object-cover shrink-0" />}
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
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(filter)}>
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
              <Input id="filter-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aquarela, Cartoon..." />
            </FormField>
            <FormField label="Modelo Fal.ai" id="filter-model" required>
              <select id="filter-model" value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {MODEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </FormField>
            {noPromptNeeded ? (
              <p className="text-sm text-muted-foreground rounded-md bg-muted p-3">Este modelo usa prompt fixo interno — nenhuma configuração adicional necessária.</p>
            ) : isStyleTransfer ? (
              <FormField label="Estilo" id="filter-style" required>
                <select id="filter-style" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Selecione um estilo...</option>
                  {STYLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </FormField>
            ) : isPhotographyEffects ? (
              <FormField label="Efeito fotográfico" id="filter-effect" required>
                <select id="filter-effect" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Selecione um efeito...</option>
                  {EFFECT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </FormField>
            ) : (
              <FormField label="Prompt (enviado à IA)" id="filter-prompt" required>
                <textarea id="filter-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva o efeito desejado para a IA..." rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </FormField>
            )}
            <FormField label="Imagem de referência de estilo (opcional)" id="filter-style-image">
              <StyleImageUpload value={styleImageUrl} onChange={setStyleImageUrl} />
            </FormField>
            {styleImageUrl && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendStyleImage}
                  onChange={(e) => setSendStyleImage(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground">Enviar imagem de referência ao fal.ai</span>
              </label>
            )}
            <FormField label="Preview CSS (prévia no celular)" id="filter-preview-css">
              <Input id="filter-preview-css" value={previewCss} onChange={(e) => setPreviewCss(e.target.value)} placeholder="Ex: grayscale(1), sepia(0.8) saturate(1.5)" />
              <p className="text-[11px] text-muted-foreground mt-1">Filtro CSS aplicado ao segurar o botão. Deixe vazio para desabilitar prévia.</p>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || (!noPromptNeeded && !prompt.trim())}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title={`Excluir "${deleteTarget?.name}"?`}
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default AiFiltersManager;
