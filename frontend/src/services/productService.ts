import { fetchApi } from './api';
import type { Product } from '../types/product';

export interface ProductListResponse {
    products: Product[];
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
}

export const productService = {
    // Получаем все товары
    getAllProducts: () => fetchApi<ProductListResponse>('/products/'),

    // Получаем товар по slug
    getProductBySlug: (slug: string) => fetchApi<ProductDetailResponse>(`/products/${slug}/`),
}