import { useState, forwardRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import { useToast } from "@/hooks/use-toast";
import GoogleIcon from "@/components/GoogleIcon";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent } from "@/lib/meta-pixel";
import { Coins } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl?: string;
}

type Tab = "login" | "signup";

const LoginDialog = ({ open, onOpenChange, redirectUrl }: LoginDialogProps) => {
  const [tab, setTab] = useState<Tab>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setAcceptedTerms(false);
    setLoading(false);
    setSent(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      clarityEvent("auth_login");
      onOpenChange(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectUrl || window.location.origin,
      },
    });
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      clarityEvent("auth_signup");
      pixelEvent("CompleteRegistration");
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUrl || window.location.origin,
    });
    if (error) {
      toast({ title: "Erro ao entrar com Google", description: String(error), variant: "destructive" });
    }
  };

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-sm p-6 text-center space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Verifique seu email</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Button variant="outline" onClick={() => { resetForm(); setTab("login"); }}>
            Voltar ao login
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        {/* Incentive banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">🎁 Ganhe 50 moedas grátis!</p>
              <p className="text-xs text-white/85 leading-tight mt-0.5">Crie sua conta e use em filtros IA, upscale e mais</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                tab === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                tab === "signup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Google OAuth */}
          <Button variant="outline" className="w-full" onClick={handleGoogle}>
            <GoogleIcon />
            {tab === "login" ? "Entrar com Google" : "Criar com Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <FormField label="Email" id="dlg-email">
                <Input
                  id="dlg-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </FormField>
              <FormField
                label="Senha"
                id="dlg-password"
                labelExtra={
                  <Link to="/reset-password" target="_blank" className="text-xs text-primary hover:underline">
                    Esqueceu?
                  </Link>
                }
              >
                <Input
                  id="dlg-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </FormField>
              <SubmitButton loading={loading} className="w-full">
                Entrar
              </SubmitButton>
            </form>
          )}

          {/* Signup form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <FormField label="Nome completo" id="dlg-name" required>
                <Input
                  id="dlg-name"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </FormField>
              <FormField label="Email" id="dlg-s-email" required>
                <Input
                  id="dlg-s-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </FormField>
              <FormField label="Senha" id="dlg-s-password" required>
                <Input
                  id="dlg-s-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </FormField>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-input"
                />
                <span className="text-muted-foreground leading-tight text-xs">
                  Li e aceito os{" "}
                  <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos</Link>
                  , a{" "}
                  <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Privacidade</Link>
                  {" "}e a{" "}
                  <Link to="/compras" target="_blank" className="text-primary hover:underline">Política de Compra</Link>
                </span>
              </label>
              <SubmitButton loading={loading} className="w-full" disabled={!acceptedTerms}>
                Criar conta
              </SubmitButton>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
