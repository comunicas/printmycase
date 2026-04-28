import { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

import UserMenu from "@/components/UserMenu";
import CoinBalance from "@/components/CoinBalance";
import { DsButton } from "@/components/ds";

interface Breadcrumb {
  label: string;
  to?: string;
}

interface AppHeaderProps {
  breadcrumbs?: Breadcrumb[];
  variant?: "default" | "transparent";
  hideNav?: boolean;
}

const AppHeader = forwardRef<HTMLElement, AppHeaderProps>(({ breadcrumbs, variant = "default", hideNav = false }, ref) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const isTransparent = variant === "transparent";
  const showGlass = isTransparent && scrolled;

  return (
    <header
      ref={ref}
      className={`relative z-50 transition-all duration-500 ${
        isTransparent
          ? showGlass
            ? "glass border-b border-white/10"
            : "bg-transparent"
          : "border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="flex-shrink-0">
            <img
              alt="PrintMyCase"
              className="h-14 sm:h-16 w-auto transition-all duration-300"
              src="/logo-printmycase-sm.webp"
              fetchPriority="high"
              width="64"
              height="64"
            />
          </Link>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground min-w-0 lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-foreground transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        {!hideNav && (
          <div className={`hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 ${isTransparent && !scrolled ? "text-white" : "text-foreground"}`}>
            <Button
              variant="ghost"
              size="sm"
              className={isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}
              onClick={() => navigate('/colecoes')}
            >
              Coleções
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}
              onClick={() => { navigate('/'); setTimeout(() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              Como funciona
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}
              onClick={() => navigate('/catalog')}
            >
              Modelos
            </Button>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <DsButton
            variant="brand"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/catalog')}
          >
            ✦ Criar minha capa
          </DsButton>
          <CoinBalance transparent={isTransparent && !scrolled} />
          <UserMenu transparent={isTransparent && !scrolled} />
        </div>
      </nav>
    </header>
  );
});

AppHeader.displayName = "AppHeader";

export default AppHeader;
