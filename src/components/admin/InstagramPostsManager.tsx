import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import FormField from "@/components/ui/form-field";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface InstaPost {
  id: string;
  post_url: string;
  caption: string;
  thumbnail_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

const empty: Omit<InstaPost, "id" | "created_at"> = {
  post_url: "",
  caption: "",
  thumbnail_url: "",
  sort_order: 0,
  active: true,
};

const InstagramPostsManager = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InstaPost | null>(null);
  const [form, setForm] = useState(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("sort_order");
    setPosts((data as InstaPost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (p: InstaPost) => {
    setEditing(p);
    setForm({ post_url: p.post_url, caption: p.caption, sort_order: p.sort_order, active: p.active });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.post_url.trim()) {
      toast({ title: "URL obrigatória", variant: "destructive" });
      return;
    }
    if (editing) {
      const { error } = await supabase
        .from("instagram_posts")
        .update(form)
        .eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post atualizado" });
    } else {
      const { error } = await supabase.from("instagram_posts").insert(form);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post adicionado" });
    }
    setDialogOpen(false);
    load();
  };

  const remove = async () => {
    if (!confirmId) return;
    await supabase.from("instagram_posts").delete().eq("id", confirmId);
    setConfirmId(null);
    toast({ title: "Post removido" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Posts do Instagram</h2>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum post cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Legenda</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.sort_order}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                    {p.post_url.replace("https://www.instagram.com/", "").slice(0, 30)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
                <TableCell className="max-w-[150px] truncate">{p.caption || "—"}</TableCell>
                <TableCell>{p.active ? "✅" : "❌"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmId(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Post" : "Novo Post"}</DialogTitle>
            <DialogDescription>Cole a URL do post do Instagram.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="URL do Post" id="post_url" required>
              <Input
                id="post_url"
                placeholder="https://www.instagram.com/reel/..."
                value={form.post_url}
                onChange={(e) => setForm({ ...form, post_url: e.target.value })}
              />
            </FormField>
            <FormField label="Legenda (opcional)" id="caption">
              <Input
                id="caption"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </FormField>
            <div className="flex gap-4">
              <FormField label="Ordem" id="sort_order" className="flex-1">
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </FormField>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <span className="text-sm">Ativo</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={remove}
        title="Remover post?"
        description="O post será removido da vitrine."
        destructive
      />
    </div>
  );
};

export default InstagramPostsManager;
