export interface ProductImage {
  id: number;
  url: string;
  is_main: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  images: ProductImage[];
  slug: string | undefined;
  category: Category | null;
}