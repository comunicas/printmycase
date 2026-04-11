import { SlidersHorizontal, Wand2, Image as ImageIcon } from "lucide-react";

export type MobileTab = "ajustes" | "filtros" | "galeria";

interface MobileTabBarProps {
  activeTab: MobileTab | null;
  onTabClick: (tab: MobileTab) => void;
  hasFilters: boolean;
  disabled?: boolean;
}

const MobileTabBar = ({ activeTab, onTabClick, hasFilters, disabled }: MobileTabBarProps) => {
  const tabs: { id: MobileTab; label: string; icon: typeof SlidersHorizontal; hidden?: boolean }[] = [
    { id: "ajustes", label: "Ajustes", icon: SlidersHorizontal },
    { id: "filtros", label: "Filtros IA", icon: Wand2, hidden: !hasFilters },
    { id: "galeria", label: "Galeria", icon: ImageIcon },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);

  return (
    <div className={`lg:hidden border-t border-border bg-background/80 backdrop-blur-xl ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className={`grid h-12`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabClick(id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
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
