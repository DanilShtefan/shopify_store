import { fetchApi } from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  products_count: number;
  children?: Category[];
}

export interface CategoryDetail extends Category {
  products: Array<{
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    image: string;
    slug: string;
    category: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }>;
}

export interface CategoriesResponse {
  categories: Category[];
}

export const categoryService = {
  // Получить все категории
  getCategories: () => fetchApi<CategoriesResponse>('/categories/'),

  // Получить категорию с товарами
  getCategory: (slug: string) => fetchApi<CategoryDetail>(`/categories/${slug}/`),
};
