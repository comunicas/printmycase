import { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";

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

const MOBILE_NAV_ITEMS: { label: string; to?: string; action?: () => void }[] = [
  { label: "Capas de Celular", to: "/capa-celular" },
  { label: "Coleções", to: "/colecoes" },
  { label: "Modelos", to: "/catalog" },
  { label: "Contato", to: "/contato" },
];

const AppHeader = forwardRef<HTMLElement, AppHeaderProps>(({ breadcrumbs, variant = "default", hideNav = false }, ref) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [mobileOpen]);

  const isTransparent = variant === "transparent";
  const showGlass = isTransparent && scrolled;
  const hasBreadcrumbs = !!breadcrumbs && breadcrumbs.length > 0;
  // Center nav only shows on root pages (no breadcrumbs) AND when hideNav is false.
  // On internal pages the breadcrumb takes the visual lead and the global nav moves to the hamburger.
  const showCenterNav = !hideNav && !hasBreadcrumbs;

  const goHowItWorks = () => {
    setMobileOpen(false);
    navigate("/");
    setTimeout(() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

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
          {hasBreadcrumbs && (
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground min-w-0 max-w-[180px] md:max-w-[240px] lg:max-w-[480px] xl:max-w-[640px] 2xl:max-w-none">
              {breadcrumbs!.map((crumb, i) => (
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
        {showCenterNav && (
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
              onClick={goHowItWorks}
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
          {!hideNav && (
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden h-9 w-9 ${isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-base font-semibold text-foreground">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="flex flex-col gap-1">
                {MOBILE_NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to!}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 rounded-md text-base text-foreground hover:bg-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={goHowItWorks}
                    className="block w-full text-left px-3 py-3 rounded-md text-base text-foreground hover:bg-accent transition-colors"
                  >
                    Como funciona
                  </button>
                </li>
              </ul>
            </nav>
            <div className="p-4 border-t">
              <DsButton
                variant="brand"
                size="sm"
                className="w-full"
                onClick={() => { setMobileOpen(false); navigate('/catalog'); }}
              >
                ✦ Criar minha capa
              </DsButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

AppHeader.displayName = "AppHeader";

export default AppHeader;
