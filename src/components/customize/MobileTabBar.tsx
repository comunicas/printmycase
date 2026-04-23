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

  return (
    <div className="lg:hidden border-t border-border bg-background/80 backdrop-blur-xl">
      <div className={`grid h-12`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const isDisabled = !!disabled && id !== "info";
          return (
            <button
              key={id}
              onClick={() => onTabClick(id)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
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
