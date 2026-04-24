import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Input } from '@/components/ui/input';
import FormField from '@/components/ui/form-field';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import GoogleIcon from '@/components/GoogleIcon';
import { clarityEvent } from '@/lib/clarity';
import { pixelEvent } from '@/lib/meta-pixel';
import { Check } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import { DsButton } from '@/components/ds';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast({ title: 'Erro ao criar conta', description: error.message, variant: 'destructive' });
    } else {
      clarityEvent('auth_signup');
      pixelEvent('CompleteRegistration');
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: 'Erro ao criar com Google', description: String(error), variant: 'destructive' });
    }
  };

  // Estado de sucesso — email de verificação enviado
  if (sent) {
    return (
      <AuthLayout>
        <AuthCard showBanner={false}>
          <div className="text-center space-y-5 py-2">
            {/* Ícone de sucesso com gradient-brand */}
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-elevated)' }}
            >
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Verifique seu email
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enviamos um link de confirmação para{' '}
                <strong className="text-foreground">{email}</strong>.
                <br />
                Clique no link para ativar sua conta.
              </p>
            </div>

            <DsButton href="/login" variant="outline" className="w-full">
              Voltar ao login
            </DsButton>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Criar conta grátis
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre-se para personalizar sua capa
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground"
        >
          <GoogleIcon />
          Criar com Google
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
        <form onSubmit={handleSignup} className="space-y-4">
          <FormField label="Nome completo" id="name" required>
            <Input
              id="name"
              placeholder="Seu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              className="rounded-xl"
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
              className="rounded-xl"
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
              className="rounded-xl"
            />
          </FormField>

          {/* Checkbox termos — estilo DS */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-transparent flex items-center justify-center transition-all peer-checked:[background:var(--gradient-brand)]"
              >
                {acceptedTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
            </div>
            <span className="text-muted-foreground leading-snug text-xs">
              Li e aceito os{' '}
              <Link to="/termos" target="_blank" className="text-primary hover:underline">
                Termos de Uso
              </Link>
              , a{' '}
              <Link to="/privacidade" target="_blank" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              {' '}e a{' '}
              <Link to="/compras" target="_blank" className="text-primary hover:underline">
                Política de Compra e Devolução
              </Link>
            </span>
          </label>

          {/* CTA principal com gradient-brand */}
          <DsButton type="submit" variant="brand" className="w-full" disabled={loading || !acceptedTerms}>
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </DsButton>
        </form>

        {/* Link login */}
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
