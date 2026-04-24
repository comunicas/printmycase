import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout base para páginas de autenticação.
 * Aplica o mesmo fundo da LP (grid sutil + glow decorativo).
 * Não inclui AppHeader — exibe logo próprio para contexto limpo.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* Grid de fundo sutil — igual ao hero da LP */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow decorativo roxo — canto superior direito (igual ao hero) */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'var(--gradient-glow)',
          opacity: 0.6,
        }}
      />

      {/* Glow decorativo laranja — canto inferior esquerdo (contraste) */}
      <div
        className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom left, hsl(25 95% 60% / 0.12), transparent 70%)',
        }}
      />

      {/* Header minimalista — logo + link voltar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" aria-label="Voltar para a home">
          <img
            src="/logo-printmycase-sm.webp"
            alt="PrintMyCase"
            className="h-12 w-auto"
            width={48}
            height={48}
          />
        </Link>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          ← Voltar
        </Link>
      </header>

      {/* Conteúdo central */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        {children}
      </main>

      {/* Rodapé minimalista */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground">
        © 2026 PrintMyCase · 
        <Link to="/termos" className="hover:text-foreground transition-colors ml-1">Termos</Link>
        {' · '}
        <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
      </footer>
    </div>
  );
}
