import { fetchApi } from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  products_count: number;
  children?: Category[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export const categoryService = {
  // Получить все категории
  getCategories: () => fetchApi<CategoriesResponse>('/categories/'),
};
