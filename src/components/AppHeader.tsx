import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

type MobileNavItem = { label: string; to?: string; anchor?: string };

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Capas de Celular", to: "/capa-celular" },
  { label: "Coleções", to: "/colecoes" },
  { label: "Como funciona", anchor: "como-funciona" },
  { label: "Gerações IA", anchor: "ia-em-acao" },
  { label: "Impressão", anchor: "impressao" },
  { label: "Contato", to: "/contato" },
];

const AppHeader = forwardRef<HTMLElement, AppHeaderProps>(({ breadcrumbs, variant = "default", hideNav = false }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastRouteRef = useRef(location.pathname + location.search + location.hash);

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Auto-close drawer on any route change (covers links, programmatic navigation, redirects).
  useEffect(() => {
    const current = location.pathname + location.search + location.hash;
    if (current !== lastRouteRef.current) {
      lastRouteRef.current = current;
      if (mobileOpen) setMobileOpen(false);
    }
  }, [location, mobileOpen]);

  // While drawer is open: iOS-safe scroll lock + Escape + focus management.
  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);

      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);

      // Restore focus to the trigger that opened the drawer (a11y).
      triggerRef.current?.focus();
    };
  }, [mobileOpen]);

  const isTransparent = variant === "transparent";
  const showGlass = isTransparent && scrolled;
  const hasBreadcrumbs = !!breadcrumbs && breadcrumbs.length > 0;
  // Center nav only on root pages (no breadcrumbs) — on internal pages the breadcrumb leads.
  const showCenterNav = !hideNav && !hasBreadcrumbs;

  const goAnchor = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const drawer = mobileOpen ? (
    <div
      className="fixed inset-0 z-[100] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in"
        onClick={closeMobile}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-xl flex flex-col animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-base font-semibold text-foreground">Menu</span>
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto overscroll-contain p-2">
          <ul className="flex flex-col gap-1">
            {MOBILE_NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={closeMobile}
                    className="block px-3 py-3 rounded-md text-base text-foreground hover:bg-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => item.anchor && goAnchor(item.anchor)}
                    className="block w-full text-left px-3 py-3 rounded-md text-base text-foreground hover:bg-accent transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <DsButton
            variant="brand"
            size="sm"
            className="w-full"
            onClick={() => { closeMobile(); navigate('/catalog'); }}
          >
            ✦ Criar minha capa
          </DsButton>
        </div>
      </div>
    </div>
  ) : null;

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
              onClick={() => goAnchor('como-funciona')}
            >
              Como funciona
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}
              onClick={() => goAnchor('ia-em-acao')}
            >
              Gerações IA
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}
              onClick={() => goAnchor('impressao')}
            >
              Impressão
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
              ref={triggerRef}
              variant="ghost"
              size="icon"
              className={`lg:hidden h-9 w-9 ${isTransparent && !scrolled ? "text-white hover:text-white hover:bg-white/10" : ""}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </nav>

      {drawer && typeof document !== "undefined" && createPortal(drawer, document.body)}
    </header>
  );
});

AppHeader.displayName = "AppHeader";

export default AppHeader;
