import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

interface LegalDoc {
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

const LegalDocsManager = () => {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [editing, setEditing] = useState<LegalDoc | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("legal_documents")
      .select("*")
      .order("slug");
    if (data) setDocs(data);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("legal_documents")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("slug", editing.slug);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Documento atualizado!" });
      setEditing(null);
      fetchDocs();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Documentos Legais</h2>
      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.slug} className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                Atualizado em {new Date(doc.updated_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditing(doc); setContent(doc.content); }}
            >
              <Pencil className="w-4 h-4 mr-1" /> Editar
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar {editing?.title}</DialogTitle>
          </DialogHeader>
          <textarea
            className="flex-1 min-h-[400px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LegalDocsManager;
