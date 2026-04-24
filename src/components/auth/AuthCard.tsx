import { Coins } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  /** Exibe o banner laranja de incentivo (50 moedas). Default: true */
  showBanner?: boolean;
}

/**
 * Card container para formulários de auth.
 * Aplica shadow-elevated, border e radius do DS.
 * Inclui o banner de incentivo de moedas.
 */
export default function AuthCard({ children, showBanner = true }: AuthCardProps) {
  return (
    <div
      className="w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      {/* Banner de incentivo — moedas grátis */}
      {showBanner && (
        <div
          className="px-5 py-4 text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 55%))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">
                🎁 Ganhe 50 moedas grátis!
              </p>
              <p className="text-xs text-white/85 leading-tight mt-0.5">
                Crie sua conta e use em filtros IA, upscale e mais
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo do card */}
      <div className="p-7 space-y-5">
        {children}
      </div>
    </div>
  );
}
