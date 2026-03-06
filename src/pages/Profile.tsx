import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, AlertTriangle, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { maskPhone } from "@/lib/masks";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import FormCard from "@/components/forms/FormCard";
import SubmitButton from "@/components/forms/SubmitButton";

const Profile = () => {
  const { user, profile, refetchProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ? maskPhone(profile.phone) : "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ? maskPhone(profile.phone) : "");
    }
  }, [profile?.id]);

  const currentAvatar = avatarPreview ?? profile?.avatar_url;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 2 MB.", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }
      const rawPhone = phone.replace(/\D/g, "") || null;
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: rawPhone, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (error) throw error;
      await refetchProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
      toast({ title: "Perfil atualizado!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não coincidem", description: "Verifique e tente novamente.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Senha alterada com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao alterar senha", description: err.message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "EXCLUIR") return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erro ao excluir conta", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  const initials = (profile?.full_name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Meu Perfil" }]} />

      <main className="max-w-lg mx-auto px-5 py-10 space-y-6">
        {/* Profile info */}
        <FormCard title="Meu Perfil">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-border" />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {initials}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">Clique para alterar (máx. 2 MB)</p>
            </div>

            <FormField label="Nome completo" id="fullName" required>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" autoComplete="name" required />
            </FormField>

            <FormField label="Telefone" id="phone">
              <Input id="phone" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" />
            </FormField>

            <FormField label="E-mail" id="email">
              <Input value={user?.email ?? ""} disabled />
            </FormField>

            <SubmitButton loading={saving} className="w-full">
              Salvar alterações
            </SubmitButton>
          </form>
        </FormCard>

        {/* Referral */}
        {profile?.referral_code && (
          <FormCard title="Convide amigos" description="Ganhe 50 moedas por cada amigo que criar uma conta.">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg truncate">
                {`${window.location.origin}/signup?ref=${profile.referral_code}`}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${profile.referral_code}`);
                  toast({ title: "Link copiado!" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </FormCard>
        )}

        {/* Change password */}
        <FormCard title="Alterar senha">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FormField label="Nova senha" id="newPassword" required>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" required minLength={6} />
            </FormField>
            <FormField label="Confirmar nova senha" id="confirmPassword" required>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" required minLength={6} />
            </FormField>
            <SubmitButton loading={savingPassword} variant="secondary" className="w-full">
              Alterar senha
            </SubmitButton>
          </form>
        </FormCard>

        {/* Delete account */}
        <FormCard title="Excluir conta" description="Esta ação é irreversível. Todos os seus dados serão permanentemente removidos." variant="destructive">
          {!showDeleteDialog ? (
            <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Excluir minha conta
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Digite <span className="font-bold text-destructive">EXCLUIR</span> para confirmar:
              </p>
              <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="EXCLUIR" />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(""); }}>
                  Cancelar
                </Button>
                <SubmitButton loading={deleting} variant="destructive" className="flex-1" disabled={deleteConfirmText !== "EXCLUIR"} onClick={handleDeleteAccount}>
                  Confirmar exclusão
                </SubmitButton>
              </div>
            </div>
          )}
        </FormCard>
      </main>
    </div>
  );
};

export default Profile;
