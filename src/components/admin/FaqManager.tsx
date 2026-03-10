import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Star, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/form-field";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  featured: boolean;
  kb_article_id: string | null;
}

interface KbArticleOption {
  id: string;
  title: string;
  category_name: string;
}

const FaqManager = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [articles, setArticles] = useState<KbArticleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [featured, setFeatured] = useState(false);
  const [kbArticleId, setKbArticleId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [faqRes, artRes] = await Promise.all([
      supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
      supabase.from("kb_articles").select("id, title, category_id, kb_categories(name)").eq("active", true).order("title"),
    ]);
    if (faqRes.error) toast({ title: "Erro ao carregar FAQs", description: faqRes.error.message, variant: "destructive" });
    else setFaqs(faqRes.data ?? []);

    if (artRes.data) {
      setArticles(artRes.data.map((a: any) => ({
        id: a.id,
        title: a.title,
        category_name: a.kb_categories?.name ?? "",
      })));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => {
    setEditing(null); setQuestion(""); setAnswer(""); setFeatured(false); setKbArticleId("");
    setDialogOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditing(faq); setQuestion(faq.question); setAnswer(faq.answer);
    setFeatured(faq.featured); setKbArticleId(faq.kb_article_id ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      featured,
      kb_article_id: kbArticleId || null,
    };

    if (editing) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      else toast({ title: "FAQ atualizado" });
    } else {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.sort_order)) : 0;
      const { error } = await supabase.from("faqs").insert({ ...payload, sort_order: maxOrder + 1 });
      if (error) toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      else toast({ title: "FAQ criado" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleToggleActive = async (faq: Faq) => {
    await supabase.from("faqs").update({ active: !faq.active }).eq("id", faq.id);
    fetchData();
  };

  const handleToggleFeatured = async (faq: Faq) => {
    await supabase.from("faqs").update({ featured: !faq.featured }).eq("id", faq.id);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("faqs").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else { toast({ title: "FAQ excluído" }); fetchData(); }
    setDeleteTarget(null);
  };

  const handleMove = async (faq: Faq, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === faq.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const other = faqs[swapIdx];
    await Promise.all([
      supabase.from("faqs").update({ sort_order: other.sort_order }).eq("id", faq.id),
      supabase.from("faqs").update({ sort_order: faq.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">FAQ da Home</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova Pergunta</Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma pergunta cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!faq.active ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5 mr-2">
                <button onClick={() => handleMove(faq, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(faq, "down")} disabled={idx === faqs.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{faq.question}</p>
                  {faq.featured && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
                  {faq.kb_article_id && <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleToggleFeatured(faq)} title={faq.featured ? "Remover destaque" : "Destacar na Home"}>
                  <Star className={`w-4 h-4 ${faq.featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleToggleActive(faq)} title={faq.active ? "Desativar" : "Ativar"}>
                  {faq.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(faq)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(faq)}>
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
            <DialogTitle>{editing ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Pergunta" id="faq-question" required>
              <Input id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: Como funciona a impressão?" />
            </FormField>
            <FormField label="Resposta" id="faq-answer" required>
              <textarea
                id="faq-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escreva a resposta..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </FormField>
            <FormField label="Artigo vinculado (opcional)" id="faq-article">
              <select
                id="faq-article"
                value={kbArticleId}
                onChange={(e) => setKbArticleId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Nenhum</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.category_name ? `${art.category_name} › ` : ""}{art.title}
                  </option>
                ))}
              </select>
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-input" />
              <span className="text-sm text-foreground">Destacar na Home</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !question.trim() || !answer.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title={`Excluir "${deleteTarget?.question}"?`}
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default FaqManager;
