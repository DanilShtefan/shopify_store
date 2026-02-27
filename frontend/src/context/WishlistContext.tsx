import { createContext, useState, useCallback, type ReactNode, useEffect, useContext } from 'react';
import { wishlistService, type Wishlist } from '../services/wishlistService';
import { ToastContext } from './ToastContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (itemId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastContext = useContext(ToastContext);

  const refreshWishlist = useCallback(async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
      setError(null);
    } catch (err) {
      setWishlist(null);
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: number) => {
    try {
      const data = await wishlistService.addItem({ product_id: productId });
      setWishlist(data);
      setError(null);
      toastContext?.showToast('Товар добавлен в избранное', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить в избранное';
      setError(message);
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const removeFromWishlist = useCallback(async (itemId: number) => {
    try {
      const data = await wishlistService.removeItem(itemId);
      setWishlist(data);
      toastContext?.showToast('Товар удалён из избранного', 'info');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить товар';
      setError(message);
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, error, addToWishlist, removeFromWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
