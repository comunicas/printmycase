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

const defaultColors: ProductColor[] = [
  { id: "black", name: "Preto", hex: "#1a1a1a" },
  { id: "white", name: "Branco", hex: "#f5f5f5" },
  { id: "blue", name: "Azul", hex: "#3b82f6" },
  { id: "red", name: "Vermelho", hex: "#ef4444" },
];

const defaultDescription =
  "Capa premium de policarbonato rígido com acabamento soft-touch. Proteção contra impactos com bordas elevadas para câmera e tela. Totalmente personalizável com suas fotos e designs favoritos.";

const mockImages = [
  "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&h=800&fit=crop",
];

function makeSpecs(model: string, dimensions: string, weight: string): ProductSpec[] {
  return [
    { label: "Material", value: "Policarbonato + TPU" },
    { label: "Peso", value: weight },
    { label: "Dimensões", value: dimensions },
    { label: "Compatibilidade", value: model },
    { label: "Proteção", value: "Queda de até 1.5m" },
    { label: "Acabamento", value: "Soft-touch matte" },
    { label: "Carregamento sem fio", value: "Compatível" },
  ];
}

export const products: Product[] = [
  {
    id: "iphone-17-pro-max",
    name: "Capa iPhone 17 Pro Max",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 17 Pro Max", "163.0 x 77.6 x 1.2 mm", "30g"),
    rating: 4.9,
    reviewCount: 58,
  },
  {
    id: "iphone-17-pro",
    name: "Capa iPhone 17 Pro",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 17 Pro", "159.9 x 76.7 x 1.2 mm", "29g"),
    rating: 4.8,
    reviewCount: 45,
  },
  {
    id: "iphone-17-air",
    name: "Capa iPhone 17 Air",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 17 Air", "155.0 x 74.0 x 1.1 mm", "26g"),
    rating: 4.8,
    reviewCount: 37,
  },
  {
    id: "iphone-17",
    name: "Capa iPhone 17",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 17", "147.6 x 71.6 x 1.2 mm", "28g"),
    rating: 4.7,
    reviewCount: 52,
  },
  {
    id: "iphone-15-pro-max",
    name: "Capa iPhone 15 Pro Max",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 15 Pro Max", "159.9 x 76.7 x 1.2 mm", "32g"),
    rating: 4.7,
    reviewCount: 42,
  },
  {
    id: "iphone-xs-max",
    name: "Capa iPhone Xs Max",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone Xs Max", "157.5 x 77.4 x 1.2 mm", "31g"),
    rating: 4.6,
    reviewCount: 38,
  },
  {
    id: "iphone-x-xs",
    name: "Capa iPhone X/Xs",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone X / Xs", "143.6 x 70.9 x 1.1 mm", "27g"),
    rating: 4.7,
    reviewCount: 61,
  },
  {
    id: "iphone-xr",
    name: "Capa iPhone Xr",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone Xr", "150.9 x 75.7 x 1.2 mm", "29g"),
    rating: 4.6,
    reviewCount: 44,
  },
  {
    id: "iphone-x",
    name: "Capa iPhone X",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone X", "143.6 x 70.9 x 1.1 mm", "27g"),
    rating: 4.5,
    reviewCount: 55,
  },
  {
    id: "iphone-se-3",
    name: "Capa iPhone SE 3",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone SE (3ª geração)", "138.4 x 67.3 x 1.0 mm", "24g"),
    rating: 4.6,
    reviewCount: 33,
  },
  {
    id: "iphone-11-pro-max",
    name: "Capa iPhone 11 Pro Max",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 11 Pro Max", "158.0 x 77.8 x 1.2 mm", "31g"),
    rating: 4.7,
    reviewCount: 48,
  },
  {
    id: "iphone-11-pro",
    name: "Capa iPhone 11 Pro",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 11 Pro", "144.0 x 71.4 x 1.1 mm", "28g"),
    rating: 4.8,
    reviewCount: 39,
  },
  {
    id: "iphone-11",
    name: "Capa iPhone 11",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 11", "150.9 x 75.7 x 1.2 mm", "29g"),
    rating: 4.6,
    reviewCount: 56,
  },
  {
    id: "iphone-7-8-plus",
    name: "Capa iPhone 7/8 Plus",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 7 Plus / 8 Plus", "158.4 x 78.1 x 1.2 mm", "30g"),
    rating: 4.5,
    reviewCount: 67,
  },
  {
    id: "iphone-7-8",
    name: "Capa iPhone 7/8",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 7 / 8", "138.4 x 67.3 x 1.0 mm", "25g"),
    rating: 4.6,
    reviewCount: 72,
  },
  {
    id: "iphone-7-plus",
    name: "Capa iPhone 7 Plus",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 7 Plus", "158.2 x 77.9 x 1.2 mm", "30g"),
    rating: 4.5,
    reviewCount: 41,
  },
  {
    id: "iphone-7",
    name: "Capa iPhone 7",
    price: 69.9,
    description: defaultDescription,
    images: mockImages,
    colors: defaultColors,
    specs: makeSpecs("iPhone 7", "138.3 x 67.1 x 1.0 mm", "25g"),
    rating: 4.5,
    reviewCount: 49,
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
