import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const Catalog = () => {
  const { products, loading } = useProducts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Catálogo" }]} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-5 lg:p-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Nossos Modelos</h2>
          <span className="text-sm text-muted-foreground">{products.length} capas disponíveis</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
