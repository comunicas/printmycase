export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  colors: ProductColor[];
  specs: ProductSpec[];
  rating: number;
  reviewCount: number;
}

export const products: Product[] = [
  {
    id: "iphone-15-pro-max",
    name: "Capa iPhone 15 Pro Max",
    price: 79.9,
    description:
      "Capa premium de policarbonato rígido com acabamento soft-touch. Proteção contra impactos com bordas elevadas para câmera e tela. Totalmente personalizável com suas fotos e designs favoritos.",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    colors: [
      { id: "black", name: "Preto", hex: "#1a1a1a" },
      { id: "white", name: "Branco", hex: "#f5f5f5" },
      { id: "blue", name: "Azul", hex: "#3b82f6" },
      { id: "red", name: "Vermelho", hex: "#ef4444" },
    ],
    specs: [
      { label: "Material", value: "Policarbonato + TPU" },
      { label: "Peso", value: "32g" },
      { label: "Dimensões", value: "160.7 x 78.1 x 1.2 mm" },
      { label: "Compatibilidade", value: "iPhone 15 Pro Max" },
      { label: "Proteção", value: "Queda de até 1.5m" },
      { label: "Acabamento", value: "Soft-touch matte" },
      { label: "MagSafe", value: "Compatível" },
      { label: "Carregamento sem fio", value: "Compatível" },
    ],
    rating: 4.7,
    reviewCount: 42,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
