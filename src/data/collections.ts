export type Product = {
  slug: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  sku: string;
  description: string;
  sizes?: string[];
  bestSeller?: boolean;
  isNew?: boolean;
};
export const collections = [
  {
    slug: "sandalias",
    title: "Sandalias",
    filter: (product: Product) => product.category === "sandalias",
  },
  {
    slug: "zapatillas",
    title: "Zapatillas",
    filter: (product: Product) => product.category === "zapatillas",
  },
  {
    slug: "balerinas",
    title: "Balerinas",
    filter: (product: Product) => product.category === "balerinas",
  },
  {
    slug: "nuevo",
    title: "Lo más nuevo",
    filter: (product: Product) => product.isNew === true,
  },
];