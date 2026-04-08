import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string | null;
}

const ContactMessagesManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { paginated, page, setPage, totalPages } = usePagination(messages, 10);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== deleteId));
    }
    setDeleteId(null);
  };

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Carregando…</p>;

  if (!messages.length) return <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma mensagem recebida.</p>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden sm:table-cell">Mensagem</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell className="hidden sm:table-cell max-w-[200px] truncate">{m.message}</TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                {m.created_at ? new Date(m.created_at).toLocaleDateString("pt-BR") : "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setViewMsg(m)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Mensagem de {viewMsg?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{viewMsg?.email}</p>
          <p className="text-sm whitespace-pre-wrap mt-2">{viewMsg?.message}</p>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir mensagem?"
        description="Essa ação não pode ser desfeita."
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

export default ContactMessagesManager;
