import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";
import ProductsManager from "@/components/admin/ProductsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import AiFiltersManager from "@/components/admin/AiFiltersManager";
import ModelRequestsManager from "@/components/admin/ModelRequestsManager";
import CoinsManager from "@/components/admin/CoinsManager";
import LegalDocsManager from "@/components/admin/LegalDocsManager";
import KbCategoriesManager from "@/components/admin/KbCategoriesManager";
import KbArticlesManager from "@/components/admin/KbArticlesManager";
import FaqManager from "@/components/admin/FaqManager";
import GalleryImagesManager from "@/components/admin/GalleryImagesManager";
import ImageGalleriesManager from "@/components/admin/ImageGalleriesManager";
import AiGenerationsManager from "@/components/admin/AiGenerationsManager";
import UserGenerationsManager from "@/components/admin/UserGenerationsManager";
import CoinPackagesManager from "@/components/admin/CoinPackagesManager";
import CollectionsManager from "@/components/admin/CollectionsManager";
import CollectionDesignsManager from "@/components/admin/CollectionDesignsManager";
import AiFilterCategoriesManager from "@/components/admin/AiFilterCategoriesManager";
import UsersManager from "@/components/admin/UsersManager";
import StoresManager from "@/components/admin/StoresManager";
import InstagramPostsManager from "@/components/admin/InstagramPostsManager";

const sectionMap: Record<AdminSection, React.ComponentType> = {
  orders: OrdersManager,
  users: UsersManager,
  requests: ModelRequestsManager,
  products: ProductsManager,
  collections: CollectionsManager,
  designs: CollectionDesignsManager,
  stores: StoresManager,
  "ai-filters": AiFiltersManager,
  "ai-categories": AiFilterCategoriesManager,
  illustrations: GalleryImagesManager,
  galleries: ImageGalleriesManager,
  "ai-generations": AiGenerationsManager,
  "user-generations": UserGenerationsManager,
  "coin-transactions": CoinsManager,
  "coin-packages": CoinPackagesManager,
  "kb-categories": KbCategoriesManager,
  "kb-articles": KbArticlesManager,
  "instagram-posts": InstagramPostsManager,
  faq: FaqManager,
  legal: LegalDocsManager,
};

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-existing-images");
      if (error) throw error;
      toast({
        title: "Otimização concluída",
        description: `${data.optimized} imagens otimizadas, ${data.errors} erros.`,
      });
    } catch (err: any) {
      toast({ title: "Erro ao otimizar", description: err.message, variant: "destructive" });
    } finally {
      setOptimizing(false);
    }
  };

  const ActiveManager = sectionMap[activeSection];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onOptimize={handleOptimize}
          optimizing={optimizing}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader breadcrumbs={[{ label: "Admin" }]} />
          <div className="flex items-center gap-2 border-b px-4 h-10">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Painel Admin</h1>
          </div>
          <main className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-5 py-6">
              <ActiveManager />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
