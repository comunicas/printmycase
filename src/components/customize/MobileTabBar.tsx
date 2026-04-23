import { CircleHelp, SlidersHorizontal, Wand2 } from "lucide-react";

export type MobileTab = "ajustes" | "info" | "filtros";

interface MobileTabBarProps {
  activeTab: MobileTab | null;
  onTabClick: (tab: MobileTab) => void;
  hasFilters: boolean;
  disabled?: boolean;
}

const MobileTabBar = ({ activeTab, onTabClick, hasFilters, disabled }: MobileTabBarProps) => {
  const tabs: { id: MobileTab; label: string; icon: typeof SlidersHorizontal; hidden?: boolean }[] = [
    { id: "filtros", label: "Filtros IA", icon: Wand2, hidden: !hasFilters },
    { id: "ajustes", label: "Ajustes", icon: SlidersHorizontal },
    { id: "info", label: "Detalhes", icon: CircleHelp },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);
  const tabIds: Record<MobileTab, string> = {
    filtros: "customize-mobile-tab-filtros",
    ajustes: "customize-mobile-tab-ajustes",
    info: "customize-mobile-tab-info",
  };
  const panelIds: Record<MobileTab, string> = {
    filtros: "customize-mobile-panel-filtros",
    ajustes: "customize-mobile-panel-ajustes",
    info: "customize-mobile-panel-info",
  };

  const focusTab = (tab: MobileTab) => {
    const target = document.getElementById(tabIds[tab]);
    if (target instanceof HTMLButtonElement) target.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number, tab: MobileTab, isDisabled: boolean) => {
    if (isDisabled) return;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
    }

    if (event.key === "ArrowRight") {
      const nextTab = visibleTabs[(index + 1) % visibleTabs.length]?.id;
      if (nextTab) {
        focusTab(nextTab);
        onTabClick(nextTab);
      }
    }

    if (event.key === "ArrowLeft") {
      const previousTab = visibleTabs[(index - 1 + visibleTabs.length) % visibleTabs.length]?.id;
      if (previousTab) {
        focusTab(previousTab);
        onTabClick(previousTab);
      }
    }

    if (event.key === "Home") {
      const firstTab = visibleTabs[0]?.id;
      if (firstTab) {
        focusTab(firstTab);
        onTabClick(firstTab);
      }
    }

    if (event.key === "End") {
      const lastTab = visibleTabs[visibleTabs.length - 1]?.id;
      if (lastTab) {
        focusTab(lastTab);
        onTabClick(lastTab);
      }
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onTabClick(tab);
    }
  };

  return (
    <div className="lg:hidden border-t border-border bg-background/80 backdrop-blur-xl">
      <div role="tablist" aria-label="Navegação de personalização" className={`grid h-12`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
        {visibleTabs.map(({ id, label, icon: Icon }, index) => {
          const isActive = activeTab === id;
          const isDisabled = !!disabled && id !== "info";
          const ariaLabel = id === "filtros" ? "Abrir filtros IA" : id === "ajustes" ? "Abrir ajustes da imagem" : "Abrir detalhes do produto";
          return (
            <button
              key={id}
              id={tabIds[id]}
              onClick={() => onTabClick(id)}
              onKeyDown={(event) => handleKeyDown(event, index, id, isDisabled)}
              disabled={isDisabled}
              role="tab"
              type="button"
              tabIndex={isActive || activeTab === null ? 0 : -1}
              aria-selected={isActive}
              aria-controls={panelIds[id]}
              aria-label={ariaLabel}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              } ${isDisabled ? "opacity-50" : ""}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
