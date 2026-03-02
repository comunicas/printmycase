import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import UserMenu from "@/components/UserMenu";

interface Breadcrumb {
  label: string;
  to?: string;
}

interface AppHeaderProps {
  breadcrumbs?: Breadcrumb[];
}

const AppHeader = ({ breadcrumbs }: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="text-lg font-bold text-foreground tracking-tight flex-shrink-0">
            Case Studio
          </Link>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground min-w-0">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/catalog")}>
            Ver Modelos
          </Button>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
