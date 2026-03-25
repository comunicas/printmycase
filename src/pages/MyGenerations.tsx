import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Generation {
  id: string;
  image_url: string;
  storage_path: string;
  generation_type: string;
  filter_name: string | null;
  step_number: number;
  session_id: string | null;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  filter: "Filtro IA",
  upscale: "Upscale IA",
  original: "Original",
};

const MyGenerations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_ai_generations" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setGenerations(data as unknown as Generation[]);
      setLoading(false);
    })();
  }, [user]);

  const handleDelete = async (gen: Generation) => {
    setDeleting(gen.id);
    try {
      // Delete from storage
      if (gen.storage_path) {
        await supabase.storage.from("customizations").remove([gen.storage_path]);
      }
      // Delete record
      await supabase.from("user_ai_generations" as any).delete().eq("id", gen.id);
      setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
      toast({ title: "Imagem removida" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (gen: Generation) => {
    try {
      const res = await fetch(gen.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `geracao-${gen.generation_type}-${gen.step_number}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(gen.image_url, "_blank");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Group by session_id
  const grouped = generations.reduce<Record<string, Generation[]>>((acc, gen) => {
    const key = gen.session_id || gen.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(gen);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Minhas Gerações IA</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <ImageIcon className="h-16 w-16 opacity-30" />
            <p className="text-center">Nenhuma geração encontrada.</p>
            <p className="text-sm text-center">Aplique filtros IA ou upscale na customização para ver seu histórico aqui.</p>
            <Button onClick={() => navigate("/customize")} variant="outline">Ir para customização</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([sessionKey, gens]) => (
              <div key={sessionKey} className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Sessão • {formatDate(gens[0].created_at)}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gens.map((gen) => (
                    <div key={gen.id} className="group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                      <div className="aspect-[9/16] bg-muted">
                        <img
                          src={gen.image_url}
                          alt={`${typeLabels[gen.generation_type] || gen.generation_type} #${gen.step_number}`}
                          width={180}
                          height={320}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleDownload(gen)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDelete(gen)}
                            disabled={deleting === gen.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {/* Badge */}
                      <div className="absolute top-1.5 left-1.5">
                        <span className="inline-flex items-center rounded-md bg-background/80 backdrop-blur px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                          {typeLabels[gen.generation_type] || gen.generation_type}
                          {gen.step_number > 1 && ` #${gen.step_number}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyGenerations;
