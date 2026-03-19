import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import logoPrintMyCase from "@/assets/logo-printmycase.png";
import GoogleIcon from "@/components/GoogleIcon";
import { clarityEvent } from "@/lib/clarity";
import { pixelEvent } from "@/lib/meta-pixel";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, referral_code: refCode || undefined },
        emailRedirectTo: window.location.origin,
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

  const handleGoogleSignup = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Erro ao criar com Google", description: String(error), variant: "destructive" });
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-sm text-center space-y-4">
            <img src={logoPrintMyCase} alt="PrintMyCase" className="h-14 mx-auto mb-2" />
            <h1 className="text-2xl font-bold tracking-tight">Verifique seu email</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">Voltar ao login</Button>
            </Link>
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
            <img src={logoPrintMyCase} alt="PrintMyCase" className="h-14 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
            <p className="text-sm text-muted-foreground">Cadastre-se para personalizar sua capa</p>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
            <GoogleIcon />
            Criar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <FormField label="Nome completo" id="name" required>
              <Input
                id="name"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </FormField>
            <FormField label="Email" id="email" required>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </FormField>
            <FormField label="Senha" id="password" required>
              <Input
                id="password"
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
              <span className="text-muted-foreground leading-tight">
                Li e aceito os{" "}
                <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
                , a{" "}
                <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
                {" "}e a{" "}
                <Link to="/compras" target="_blank" className="text-primary hover:underline">Política de Compra e Devolução</Link>
              </span>
            </label>
            <SubmitButton loading={loading} className="w-full" disabled={!acceptedTerms}>
              Criar conta
            </SubmitButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
