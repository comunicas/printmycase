import { SlidersHorizontal, Wand2, Image as ImageIcon } from "lucide-react";

export type MobileTab = "ajustes" | "filtros" | "galeria";

interface MobileTabBarProps {
  activeTab: MobileTab | null;
  onTabClick: (tab: MobileTab) => void;
  hasFilters: boolean;
}

const MobileTabBar = ({ activeTab, onTabClick, hasFilters }: MobileTabBarProps) => {
  const tabs: { id: MobileTab; label: string; icon: typeof SlidersHorizontal; hidden?: boolean }[] = [
    { id: "ajustes", label: "Ajustes", icon: SlidersHorizontal },
    { id: "filtros", label: "Filtros IA", icon: Wand2, hidden: !hasFilters },
    { id: "galeria", label: "Galeria", icon: ImageIcon },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);

  return (
    <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl">
      <div className={`grid grid-cols-${visibleTabs.length} h-12`}>
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabClick(id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
