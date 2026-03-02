import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setMode("update");
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setUpdated(true);
    }
    setLoading(false);
  };

  if (updated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-sm text-center space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Senha atualizada!</h1>
            <p className="text-sm text-muted-foreground">Sua senha foi alterada com sucesso.</p>
            <Link to="/login"><Button className="mt-4">Ir para login</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "update") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
              <p className="text-sm text-muted-foreground">Defina sua nova senha abaixo</p>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <FormField label="Nova senha" id="new-password" required>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </FormField>
              <SubmitButton loading={loading} className="w-full">
                Atualizar senha
              </SubmitButton>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-sm text-center space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Email enviado</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link para <strong>{email}</strong>. Verifique sua caixa de entrada.
            </p>
            <Link to="/login"><Button variant="outline" className="mt-4">Voltar ao login</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
            <p className="text-sm text-muted-foreground">Informe seu email para receber o link de recuperação</p>
          </div>
          <form onSubmit={handleRequest} className="space-y-4">
            <FormField label="Email" id="email" required>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <SubmitButton loading={loading} className="w-full">
              Enviar link
            </SubmitButton>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline font-medium">
              Voltar ao login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
