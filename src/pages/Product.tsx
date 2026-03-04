import { useParams } from "react-router-dom";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id);

  if (loading) {
    return <LoadingSpinner variant="fullPage" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-5 lg:p-10">
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2">
            <ProductGallery images={product.images} productName={product.name} deviceImage={product.device_image} />
          </div>
          <div className="w-full lg:w-1/2">
            <ProductInfo product={product} />
          </div>
        </section>
        <section className="mt-10">
          <ProductDetails product={product} />
        </section>
      </main>
    </div>
  );
};

export default Product;
