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
  images: ProductImage[];
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface ProductImage {
  id: number;
  url: string;
  is_main: boolean;
}

export const productService = {
    // Получаем все товары (с опциональным фильтром по категории)
    getAllProducts: (categorySlug?: string) => {
        const endpoint = categorySlug 
            ? `/products/?category=${categorySlug}`
            : '/products/';
        return fetchApi<ProductListResponse>(endpoint);
    },

    // Получаем товар по slug
    getProductBySlug: (slug: string) => fetchApi<ProductDetailResponse>(`/products/${slug}/`),
}