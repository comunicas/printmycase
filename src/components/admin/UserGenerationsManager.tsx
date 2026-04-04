import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Maximize2, Eye, EyeOff, Filter, Coins, User } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useCoinSettings } from "@/hooks/useCoinSettings";

const PAGE_SIZE = 12;

type Generation = {
  id: string;
  user_id: string;
  image_url: string;
  storage_path: string;
  generation_type: string;
  filter_name: string | null;
  step_number: number;
  session_id: string | null;
  created_at: string;
  public: boolean;
  userName?: string;
};
type FilterType = "all" | "filter" | "upscale" | "original";
type PublicFilter = "all" | "public" | "private";

const UserGenerationsManager = () => {
  const { toast } = useToast();
  const { getSetting } = useCoinSettings();
  const [images, setImages] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Generation | null>(null);
  const [lightboxImage, setLightboxImage] = useState<Generation | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [publicFilter, setPublicFilter] = useState<PublicFilter>("all");
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  /** Detect expired signed URLs */
  const isExpiredSignedUrl = (url: string) =>
    url.includes("/sign/") || url.includes("token=");

  /** Resolve URLs: refresh signed URLs for rows with expired ones */
  const resolveUrls = async (rows: Generation[]): Promise<Generation[]> => {
    return Promise.all(
      rows.map(async (row) => {
        if (!isExpiredSignedUrl(row.image_url)) return row;
        if (!row.storage_path) return row;
        const { data } = await supabase.storage
          .from("customizations")
          .createSignedUrl(row.storage_path, 3600);
        return data?.signedUrl
          ? { ...row, image_url: data.signedUrl }
          : row;
      })
    );
  };

  /** Fetch profile names for a batch of user_ids */
  const fetchProfiles = async (userIds: string[]) => {
    const missing = userIds.filter((id) => !profilesMap[id]);
    if (missing.length === 0) return;
    const unique = [...new Set(missing)];
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", unique);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((p) => { map[p.id] = p.full_name || "Sem nome"; });
      setProfilesMap((prev) => ({ ...prev, ...map }));
    }
  };

  const getCoinCost = (type: string) => {
    if (type === "filter") return getSetting("ai_filter_cost", 1);
    if (type === "upscale") return getSetting("ai_upscale_cost", 1);
    return 0;
  };

  const fetchImages = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const from = reset ? 0 : offsetRef.current;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("user_ai_generations")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (typeFilter !== "all") query = query.eq("generation_type", typeFilter);
    if (publicFilter === "public") query = query.eq("public", true);
    if (publicFilter === "private") query = query.eq("public", false);

    const { data } = await query;
    const rows = await resolveUrls((data ?? []) as Generation[]);

    // Fetch profile names for these rows
    const userIds = rows.map((r) => r.user_id);
    fetchProfiles(userIds);

    if (reset) {
      setImages(rows);
    } else {
      setImages((prev) => [...prev, ...rows]);
    }

    offsetRef.current = from + rows.length;
    setHasMore(rows.length === PAGE_SIZE);
    loadingRef.current = false;
    setLoading(false);
  }, [typeFilter, publicFilter]);

  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchImages(true);
  }, [fetchImages]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) fetchImages(false);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchImages]);

  const optimizeBlob = async (blob: Blob, maxSize = 800, quality = 0.80): Promise<Blob> => {
    const bitmap = await createImageBitmap(blob);
    const { width: w, height: h } = bitmap;

    // Only resize if larger than maxSize
    let nw = w;
    let nh = h;
    if (w > maxSize || h > maxSize) {
      const ratio = Math.min(maxSize / w, maxSize / h);
      nw = Math.round(w * ratio);
      nh = Math.round(h * ratio);
    }

    const canvas = new OffscreenCanvas(nw, nh);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, nw, nh);
    bitmap.close();

    return canvas.convertToBlob({ type: "image/webp", quality });
  };

  const copyToPublicBucket = async (id: string, storagePath: string): Promise<string> => {
    // Download directly from private bucket (works for authenticated admin)
    const { data: fileData, error: dlError } = await supabase.storage
      .from("customizations")
      .download(storagePath);
    if (dlError || !fileData) throw new Error(dlError?.message || "Falha ao baixar imagem do storage");

    // Optimize: resize to max 800px and convert to WebP
    const optimized = await optimizeBlob(fileData);

    const publicPath = `galleries/public/${id}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("product-assets")
      .upload(publicPath, optimized, { upsert: true, contentType: "image/webp" });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(publicPath);
    return urlData.publicUrl;
  };

  const togglePublic = async (img: Generation) => {
    const newVal = !img.public;
    let publicImageUrl: string | null = null;

    if (newVal) {
      try {
        publicImageUrl = await copyToPublicBucket(img.id, img.storage_path);
      } catch (err: any) {
        toast({ title: "Erro ao copiar imagem para bucket público", description: err.message, variant: "destructive" });
        return;
      }
    }

    const { error } = await supabase
      .from("user_ai_generations")
      .update({ public: newVal, public_image_url: publicImageUrl } as any)
      .eq("id", img.id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, public: newVal } : i)));
    toast({ title: newVal ? "Imagem tornada pública" : "Imagem tornada privada" });
  };

  const [backfilling, setBackfilling] = useState(false);

  const backfillPublicImages = async () => {
    setBackfilling(true);
    try {
      const { data: rows } = await supabase
        .from("user_ai_generations")
        .select("id, storage_path")
        .eq("public", true)
        .is("public_image_url", null);

      if (!rows?.length) {
        toast({ title: "Nenhuma imagem pública para reprocessar" });
        setBackfilling(false);
        return;
      }

      let ok = 0;
      for (const row of rows) {
        try {
          const url = await copyToPublicBucket(row.id, row.storage_path);
          await supabase
            .from("user_ai_generations")
            .update({ public_image_url: url } as any)
            .eq("id", row.id);
          ok++;
        } catch {
          // skip failed ones
        }
      }
      toast({ title: `${ok}/${rows.length} imagens reprocessadas com sucesso` });
    } catch (err: any) {
      toast({ title: "Erro no backfill", description: err.message, variant: "destructive" });
    }
    setBackfilling(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.storage_path) {
      await supabase.storage.from("customizations").remove([deleteTarget.storage_path]);
    }
    const { error } = await supabase.from("user_ai_generations").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Geração excluída" });
      setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const typeLabel = (t: string) => {
    if (t === "filter") return "Filtro";
    if (t === "upscale") return "Upscale";
    if (t === "original") return "Original";
    return t;
  };

  const filterButtons: { value: FilterType; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "original", label: "Original" },
    { value: "filter", label: "Filtro" },
    { value: "upscale", label: "Upscale" },
  ];

  const publicButtons: { value: PublicFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "public", label: "Públicos" },
    { value: "private", label: "Privados" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tipo:</span>
          {filterButtons.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={typeFilter === f.value ? "default" : "outline"}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Status:</span>
          {publicButtons.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={publicFilter === f.value ? "default" : "outline"}
              onClick={() => setPublicFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={backfilling}
          onClick={backfillPublicImages}
        >
          {backfilling ? "Reprocessando…" : "Reprocessar Imagens Públicas"}
        </Button>
      </div>

      {images.length === 0 && !loading && (
        <p className="text-muted-foreground text-center py-10">Nenhuma geração encontrada.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              className="w-full relative group cursor-zoom-in"
              onClick={() => setLightboxImage(img)}
            >
              <img src={img.image_url} alt="" className="w-full h-48 object-contain bg-background" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {img.public && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Público
                </span>
              )}
            </button>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                  {typeLabel(img.generation_type)}
                </span>
                {img.filter_name && (
                  <span className="bg-accent px-1.5 py-0.5 rounded text-accent-foreground font-medium">
                    {img.filter_name}
                  </span>
                )}
                {getCoinCost(img.generation_type) > 0 && (
                  <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                    <Coins className="h-3 w-3" /> {getCoinCost(img.generation_type)}
                  </span>
                )}
                <span>·</span>
                <span>Passo {img.step_number}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate" title={profilesMap[img.user_id] || img.user_id}>
                <User className="h-3 w-3 shrink-0" />
                {profilesMap[img.user_id] || `${img.user_id.slice(0, 8)}…`}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(img.created_at).toLocaleDateString("pt-BR")} {new Date(img.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => togglePublic(img)}
                >
                  {img.public ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {img.public ? "Tornar Privado" : "Tornar Público"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(img)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {loading && <LoadingSpinner />}

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(o) => !o && setLightboxImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizar imagem</DialogTitle>
            <DialogDescription>Imagem gerada por usuário em tamanho completo</DialogDescription>
          </DialogHeader>
          {lightboxImage && (
            <div className="flex flex-col gap-3">
              <img src={lightboxImage.image_url} alt="" className="w-full max-h-[70vh] object-contain rounded" />
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                  {typeLabel(lightboxImage.generation_type)}
                </span>
                {lightboxImage.filter_name && <span>{lightboxImage.filter_name}</span>}
                <span>Passo {lightboxImage.step_number}</span>
                <span>Usuário: {lightboxImage.user_id.slice(0, 8)}…</span>
                <span>{new Date(lightboxImage.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => togglePublic(lightboxImage)}>
                  {lightboxImage.public ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {lightboxImage.public ? "Tornar Privado" : "Tornar Público"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDeleteTarget(lightboxImage); setLightboxImage(null); }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir geração?"
        description="O registro e o arquivo no storage serão removidos permanentemente."
        destructive
      />
    </div>
  );
};

export default UserGenerationsManager;
