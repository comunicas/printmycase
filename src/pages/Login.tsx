import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Input } from '@/components/ui/input';
import FormField from '@/components/ui/form-field';
import SubmitButton from '@/components/forms/SubmitButton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import GoogleIcon from '@/components/GoogleIcon';
import { clarityEvent } from '@/lib/clarity';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import { DsButton } from '@/components/ds';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
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
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
    } else {
      clarityEvent('auth_login');
      navigate(redirect);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: 'Erro ao entrar com Google', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Entrar no Studio
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground"
        >
          <GoogleIcon />
          Entrar com Google
        </button>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Formulário */}
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
              className="rounded-xl"
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
              className="rounded-xl"
            />
          </FormField>

          {/* CTA principal com gradient-brand do DS */}
          <DsButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </DsButton>
        </form>

        {/* Link cadastro */}
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Criar conta grátis
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
