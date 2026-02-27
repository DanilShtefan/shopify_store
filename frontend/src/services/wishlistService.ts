import { fetchApi } from './api';

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  product_price: string;
  product_stock: number;
}

export interface Wishlist {
  id: number;
  session_id: string;
  items: WishlistItem[];
  items_count: number;
}

export interface AddToWishlistPayload {
  product_id: number;
}

// Генерируем session_id для пользователя
function getSessionId(): string {
  let sessionId = localStorage.getItem('wishlist_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('wishlist_session_id', sessionId);
  }
  return sessionId;
}

export const wishlistService = {
  // Получить избранное
  getWishlist: () => fetchApi<Wishlist>(`/wishlist/${getSessionId()}/`),

  // Добавить товар
  addItem: (payload: AddToWishlistPayload) =>
    fetchApi<Wishlist>(`/wishlist/${getSessionId()}/add/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Удалить товар
  removeItem: (itemId: number) =>
    fetchApi<Wishlist>(`/wishlist/${getSessionId()}/remove/${itemId}/`, {
      method: 'DELETE',
    }),
};
