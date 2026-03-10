import { Package, Truck, Smartphone, Wand2, Coins, FileText, BookOpen, FolderOpen, FileQuestion, Star, Image as ImageIcon } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Admin" }]} />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold mb-6">Painel Admin</h1>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6 w-full overflow-x-auto justify-start">
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="w-4 h-4" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <Truck className="w-4 h-4" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="kb" className="gap-1.5">
              <BookOpen className="w-4 h-4" /> Base de Conhecimento
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <Smartphone className="w-4 h-4" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="ai-filters" className="gap-1.5">
              <Wand2 className="w-4 h-4" /> Filtros IA
            </TabsTrigger>
            <TabsTrigger value="coins" className="gap-1.5">
              <Coins className="w-4 h-4" /> Moedas
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-1.5">
              <FileText className="w-4 h-4" /> Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="orders"><OrdersManager /></TabsContent>
          <TabsContent value="kb">
            <Tabs defaultValue="kb-categories" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="kb-categories" className="gap-1.5">
                  <FolderOpen className="w-4 h-4" /> Categorias
                </TabsTrigger>
                <TabsTrigger value="kb-articles" className="gap-1.5">
                  <FileQuestion className="w-4 h-4" /> Artigos
                </TabsTrigger>
                <TabsTrigger value="kb-faq" className="gap-1.5">
                  <Star className="w-4 h-4" /> FAQ Home
                </TabsTrigger>
              </TabsList>
              <TabsContent value="kb-categories"><KbCategoriesManager /></TabsContent>
              <TabsContent value="kb-articles"><KbArticlesManager /></TabsContent>
              <TabsContent value="kb-faq"><FaqManager /></TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="requests"><ModelRequestsManager /></TabsContent>
          <TabsContent value="ai-filters"><AiFiltersManager /></TabsContent>
          <TabsContent value="coins"><CoinsManager /></TabsContent>
          <TabsContent value="legal"><LegalDocsManager /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
