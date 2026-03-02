import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import { getProduct } from "@/data/products";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProduct(id ?? "");

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg transition-colors hover:bg-accent"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Case Studio</h1>
        </div>
        <button
          className="p-2 rounded-lg transition-colors opacity-50 cursor-default"
          disabled
          aria-label="Ajuda (em breve)"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-5 lg:p-10">
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="w-full lg:w-1/2">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2">
            <ProductInfo product={product} />
          </div>
        </section>

        {/* Details tabs */}
        <section className="mt-10">
          <ProductDetails product={product} />
        </section>
      </main>
    </div>
  );
};

export default Product;
