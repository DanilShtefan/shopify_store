import { createContext, useState, useCallback, type ReactNode, useEffect, useContext } from 'react';
import { cartService, type Cart } from '../services/cartService';
import { ToastContext } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  selectedItems: Set<number>;
  toggleItemSelection: (itemId: number) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateItem: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  removeSelectedItems: () => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getSelectedItemsTotal: () => number;
  getSelectedItemsCount: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
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
      const currentCart = await cartService.getCart();
      if (currentCart && currentCart.items.length > 0) {
        for (const item of currentCart.items) {
          await cartService.removeItem(item.id);
        }
      }
      setCart(null);
      setSelectedItems(new Set());
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setCart(null);
    }
  }, []);

  const removeSelectedItems = useCallback(async () => {
    try {
      if (!cart) return;
      
      for (const itemId of selectedItems) {
        await cartService.removeItem(itemId);
      }
      
      // Обновляем корзину и очищаем выделение
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
      setSelectedItems(new Set());
      toastContext?.showToast('Товары оформлены', 'success');
    } catch (err) {
      console.error('Failed to remove selected items:', err);
    }
  }, [cart, selectedItems, toastContext]);

  const toggleItemSelection = useCallback((itemId: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (!cart) return;
    setSelectedItems(new Set(cart.items.map(item => item.id)));
  }, [cart]);

  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const getSelectedItemsTotal = useCallback(() => {
    if (!cart || selectedItems.size === 0) return 0;
    return cart.items
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + parseFloat(item.subtotal), 0);
  }, [cart, selectedItems]);

  const getSelectedItemsCount = useCallback(() => {
    if (!cart || selectedItems.size === 0) return 0;
    return cart.items
      .filter(item => selectedItems.has(item.id))
      .reduce((count, item) => count + item.quantity, 0);
  }, [cart, selectedItems]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Сбрасываем выделение при изменении корзины
  useEffect(() => {
    if (cart) {
      setSelectedItems(prev => {
        const validIds = new Set<number>();
        cart.items.forEach(item => {
          if (prev.has(item.id)) {
            validIds.add(item.id);
          }
        });
        return validIds;
      });
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      selectedItems,
      toggleItemSelection,
      selectAllItems,
      deselectAllItems,
      addToCart,
      updateItem,
      removeItem,
      removeSelectedItems,
      clearCart,
      refreshCart,
      getSelectedItemsTotal,
      getSelectedItemsCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}