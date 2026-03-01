import { createContext, useState, useCallback, type ReactNode, useEffect, useContext } from 'react';
import { cartService, type Cart } from '../services/cartService';
import { ToastContext } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateItem: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastContext = useContext(ToastContext);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setCart(null);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
    try {
      const data = await cartService.addItem({ product_id: productId, quantity });
      setCart(data);
      setError(null);
      toastContext?.showToast('Товар добавлен в корзину', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить товар';
      setError(message);
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    try {
      const data = await cartService.updateItem(itemId, { quantity });
      setCart(data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить корзину';
      setError(message);
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const removeItem = useCallback(async (itemId: number) => {
    try {
      const data = await cartService.removeItem(itemId);
      setCart(data);
      toastContext?.showToast('Товар удалён из корзины', 'info');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить товар';
      setError(message);
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const clearCart = useCallback(async () => {
    try {
      // Удаляем все товары из корзины по одному
      const currentCart = await cartService.getCart();
      if (currentCart && currentCart.items.length > 0) {
        for (const item of currentCart.items) {
          await cartService.removeItem(item.id);
        }
      }
      setCart(null);
    } catch (err) {
      // Тихо игнорируем ошибки при очистке
      console.error('Failed to clear cart:', err);
      setCart(null);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, addToCart, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}