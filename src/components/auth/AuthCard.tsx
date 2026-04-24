import { Coins, Sparkles } from 'lucide-react';

type BannerVariant = 'signup' | 'login';

interface AuthCardProps {
  children: React.ReactNode;
  showBanner?: boolean;
  bannerVariant?: BannerVariant;
}

export default function AuthCard({
  children,
  showBanner = true,
  bannerVariant = 'signup',
}: AuthCardProps) {
  return (
    <div
      className="w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      {showBanner && (
        <div
          className="px-5 py-4 text-white"
          style={{
            background:
              bannerVariant === 'signup'
                ? 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 55%))'
                : 'linear-gradient(135deg, hsl(265 83% 52%), hsl(265 83% 42%))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {bannerVariant === 'signup'
                ? <Coins className="w-5 h-5" />
                : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              {bannerVariant === 'signup' ? (
                <>
                  <p className="font-display font-bold text-sm leading-tight">
                    ✨ 50 moedas IA de boas-vindas
                  </p>
                  <p className="text-xs text-white/90 leading-tight mt-0.5">
                    = 3 filtros IA grátis: Cyberpunk, Cartoon 3D e mais
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display font-bold text-sm leading-tight">
                    👋 Bem-vindo de volta!
                  </p>
                  <p className="text-xs text-white/90 leading-tight mt-0.5">
                    Suas moedas IA e capas personalizadas estão te esperando
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-7 space-y-5">
        {children}
      </div>
    </div>
  );
}
