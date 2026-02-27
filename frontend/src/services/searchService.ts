import { fetchApi } from './api';

export interface SearchResult {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  slug: string;
}

export interface SearchResponse {
  products: SearchResult[];
  query: string;
}

export const searchService = {
  search: (query: string) => fetchApi<SearchResponse>(`/search/?q=${encodeURIComponent(query)}`),
};
