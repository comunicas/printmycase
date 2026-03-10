import { Package, Truck, HelpCircle, Smartphone, Wand2, Coins, FileText } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductsManager from "@/components/admin/ProductsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import FaqManager from "@/components/admin/FaqManager";
import AiFiltersManager from "@/components/admin/AiFiltersManager";
import ModelRequestsManager from "@/components/admin/ModelRequestsManager";
import CoinsManager from "@/components/admin/CoinsManager";

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
            <TabsTrigger value="faq" className="gap-1.5">
              <HelpCircle className="w-4 h-4" /> FAQ
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
          </TabsList>

          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="orders"><OrdersManager /></TabsContent>
          <TabsContent value="faq"><FaqManager /></TabsContent>
          <TabsContent value="requests"><ModelRequestsManager /></TabsContent>
          <TabsContent value="ai-filters"><AiFiltersManager /></TabsContent>
          <TabsContent value="coins"><CoinsManager /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
