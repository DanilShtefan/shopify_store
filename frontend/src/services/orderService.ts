import { fetchApi } from './api';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface OrderCreateData {
  address_id: number;
  phone: string;
  email: string;
  comment?: string;
  items: OrderItem[];
}

export interface OrderCreateResponse {
  order_number: string;
  status: string;
  total: string;
  message: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: string;
  created_at: string;
  items_count: number;
}

export interface OrderDetail extends Order {
  subtotal: string;
  shipping_cost: string;
  shipping_address: string;
  phone: string;
  email: string;
  comment: string;
  items: {
    product_id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    price: string;
    subtotal: string;
  }[];
}

export const orderService = {
  /**
   * Оформление заказа
   */
  createOrder: async (data: OrderCreateData): Promise<OrderCreateResponse> => {
    return fetchApi<OrderCreateResponse>('/orders/create/', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  },

  /**
   * Список заказов пользователя
   */
  getOrders: async (): Promise<Order[]> => {
    return fetchApi<Order[]>('/orders/', {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Детальная информация о заказе
   */
  getOrderDetail: async (orderNumber: string): Promise<OrderDetail> => {
    return fetchApi<OrderDetail>(`/orders/${orderNumber}/`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
