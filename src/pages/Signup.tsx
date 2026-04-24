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
            {/* Ícone de sucesso */}
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-elevated)' }}
            >
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>

            <div className="space-y-3">
              <h1 className="font-display font-black text-2xl tracking-tight text-foreground">
                Quase lá! 🎉
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mandamos um link de confirmação para{' '}
                <strong className="text-foreground">{email}</strong>.
              </p>
              <div
                className="rounded-xl p-4 text-left space-y-2"
                style={{ background: 'var(--surface-1)', border: '1px solid hsl(var(--border))' }}
              >
                <p className="text-xs font-semibold text-foreground">
                  Após confirmar, você recebe:
                </p>
                {[
                  '✨ 50 moedas IA de boas-vindas',
                  '🎨 3 transformações grátis (Cyberpunk, Cartoon 3D...)',
                  '🚀 Sua capa pronta em minutos',
                ].map((item) => (
                  <p key={item} className="text-xs text-muted-foreground">{item}</p>
                ))}
              </div>
            </div>

            <DsButton href="/login" variant="outline" className="w-full">
              Já confirmei — quero entrar
            </DsButton>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard bannerVariant="signup">
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="font-display font-black text-3xl tracking-tight text-foreground leading-tight">
            Sua foto vira arte.{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            >
              De graça.
            </span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cadastre-se, ganhe <strong className="text-foreground">50 moedas</strong> e
            transforme sua foto em arte IA — sem precisar de cartão.
          </p>
        </div>

        {/* Bullets de valor — o que o usuário ganha */}
        <ul className="space-y-1.5">
          {[
            '3 filtros IA gratuitos no cadastro',
            'Cyberpunk, Cartoon 3D, Pixel Art e mais',
            'Impresso e entregue em todo o Brasil',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground"
        >
          <GoogleIcon />
          Criar com Google · mais rápido ⚡
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
            {loading ? 'Criando sua conta...' : 'Quero começar grátis →'}
          </DsButton>
        </form>

        {/* Link login */}
        <p className="text-center text-sm text-muted-foreground">
          Já criou sua arte?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar na sua conta
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
