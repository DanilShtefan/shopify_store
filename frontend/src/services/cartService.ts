import { fetchApi } from './api';

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  quantity: number;
  price: string;
  subtotal: string;
  product_stock: number;
}

export interface Cart {
  id: number;
  session_id: string;
  items: CartItem[];
  total: string;
  items_count: number;
}

export interface AddToCartPayload {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartPayload {
  quantity: number;
}

// Генерируем session_id для пользователя
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export const cartService = {
  // Получить корзину
  getCart: () => fetchApi<Cart>(`/cart/${getSessionId()}/`),
  
  // Добавить товар
  addItem: (payload: AddToCartPayload) => 
    fetchApi<Cart>(`/cart/${getSessionId()}/add/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  // Обновить количество
  updateItem: (itemId: number, payload: UpdateCartPayload) => 
    fetchApi<Cart>(`/cart/${getSessionId()}/update/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  
  // Удалить товар
  removeItem: (itemId: number) => 
    fetchApi<Cart>(`/cart/${getSessionId()}/remove/${itemId}/`, {
      method: 'DELETE',
    }),
};