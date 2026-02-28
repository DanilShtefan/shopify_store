import { fetchApi } from './api';
import type { Product } from '../types/product';

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface ProductListParams {
    categorySlug?: string;
    page?: number;
    per_page?: number;
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
    // Получаем все товары (с опциональным фильтром по категории и пагинацией)
    getAllProducts: (params?: ProductListParams) => {
        const { categorySlug, page = 1, per_page = 12 } = params || {};
        
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('per_page', per_page.toString());
        
        if (categorySlug) {
            queryParams.set('category', categorySlug);
        }
        
        const endpoint = `/products/?${queryParams.toString()}`;
        return fetchApi<ProductListResponse>(endpoint);
    },

    // Получаем товар по slug
    getProductBySlug: (slug: string) => fetchApi<ProductDetailResponse>(`/products/${slug}/`),
}