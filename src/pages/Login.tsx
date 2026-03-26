import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GoogleIcon from "@/components/GoogleIcon";
import { clarityEvent } from "@/lib/clarity";
import { Coins } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirect, { replace: true });
    }
  }, [user, authLoading, navigate, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      clarityEvent("auth_login");
      navigate(redirect);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Erro ao entrar com Google", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden">
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

            <div className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Entrar no Studio</h1>
                <p className="text-sm text-muted-foreground">Acesse sua conta para continuar</p>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <GoogleIcon />
                Entrar com Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <FormField label="Email" id="email">
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
                <FormField
                  label="Senha"
                  id="password"
                  labelExtra={
                    <Link to="/reset-password" className="text-xs text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  }
                >
                  <Input
                    id="password"
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

              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
