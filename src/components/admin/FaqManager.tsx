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

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

const FaqManager = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const { toast } = useToast();

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar FAQs", description: error.message, variant: "destructive" });
    } else {
      setFaqs(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const openNew = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setDialogOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("faqs")
        .update({ question: question.trim(), answer: answer.trim() })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "FAQ atualizado" });
      }
    } else {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.sort_order)) : 0;
      const { error } = await supabase
        .from("faqs")
        .insert({ question: question.trim(), answer: answer.trim(), sort_order: maxOrder + 1 });
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "FAQ criado" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchFaqs();
  };

  const handleToggleActive = async (faq: Faq) => {
    const { error } = await supabase
      .from("faqs")
      .update({ active: !faq.active })
      .eq("id", faq.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      fetchFaqs();
    }
  };

  const handleDelete = async (faq: Faq) => {
    setDeleteTarget(faq);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("faqs").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "FAQ excluído" });
      fetchFaqs();
    }
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
    fetchFaqs();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Pergunta
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma pergunta cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!faq.active ? "opacity-50" : ""}`}
            >
              <div className="flex flex-col gap-0.5 mr-2">
                <button
                  onClick={() => handleMove(faq, "up")}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(faq, "down")}
                  disabled={idx === faqs.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{faq.question}</p>
                <p className="text-xs text-muted-foreground truncate">{faq.answer}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleToggleActive(faq)} title={faq.active ? "Desativar" : "Ativar"}>
                  {faq.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(faq)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(faq)}>
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
              <Input
                id="faq-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Como funciona a impressão?"
              />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !question.trim() || !answer.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FaqManager;
