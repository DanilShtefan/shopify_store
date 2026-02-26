export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  slug: string | undefined;
}