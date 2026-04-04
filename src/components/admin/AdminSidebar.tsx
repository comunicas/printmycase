import {
  Package, Truck, Smartphone, Wand2, Coins, FileText,
  FolderOpen, FileQuestion, Star, Image as ImageIcon,
  Sparkles, Layers, Settings, Users, Zap, Palette, MapPin, Instagram,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export type AdminSection =
  | "orders" | "users" | "requests"
  | "products" | "collections" | "designs" | "stores"
  | "ai-filters" | "ai-categories" | "illustrations" | "galleries" | "ai-generations" | "user-generations"
  | "coin-transactions" | "coin-packages"
  | "kb-categories" | "kb-articles" | "faq" | "legal" | "instagram-posts";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  onOptimize: () => void;
  optimizing: boolean;
}

const groups: { label: string; items: { key: AdminSection; label: string; icon: React.ElementType }[] }[] = [
  {
    label: "Operações",
    items: [
      { key: "orders", label: "Pedidos", icon: Truck },
      { key: "users", label: "Usuários", icon: Users },
      { key: "requests", label: "Solicitações", icon: Smartphone },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { key: "products", label: "Produtos", icon: Package },
      { key: "collections", label: "Coleções", icon: Palette },
      { key: "designs", label: "Designs", icon: ImageIcon },
      { key: "stores", label: "Lojas", icon: MapPin },
    ],
  },
  {
    label: "IA & Galeria",
    items: [
      { key: "ai-filters", label: "Filtros IA", icon: Wand2 },
      { key: "ai-categories", label: "Categorias IA", icon: Layers },
      { key: "illustrations", label: "Ilustrativas", icon: ImageIcon },
      { key: "galleries", label: "Galerias", icon: Layers },
      { key: "ai-generations", label: "Gerações IA", icon: Sparkles },
      { key: "user-generations", label: "Gerações Usuários", icon: Sparkles },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { key: "coin-transactions", label: "Transações", icon: Coins },
      { key: "coin-packages", label: "Pacotes", icon: Settings },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { key: "kb-categories", label: "KB Categorias", icon: FolderOpen },
      { key: "kb-articles", label: "KB Artigos", icon: FileQuestion },
      { key: "faq", label: "FAQ Home", icon: Star },
      { key: "legal", label: "Legal", icon: FileText },
    ],
  },
];

const AdminSidebar = ({ activeSection, onSectionChange, onOptimize, optimizing }: AdminSidebarProps) => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSelect = (key: AdminSection) => {
    onSectionChange(key);
    if (isMobile) toggleSidebar();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-2">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={activeSection === item.key}
                      tooltip={item.label}
                      onClick={() => handleSelect(item.key)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={onOptimize}
          disabled={optimizing}
          className="w-full gap-1.5"
        >
          <Zap className="w-4 h-4" />
          {!collapsed && (optimizing ? "Otimizando…" : "Otimizar Imagens")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
