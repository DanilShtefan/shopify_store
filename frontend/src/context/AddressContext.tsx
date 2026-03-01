import { createContext, useState, useCallback, type ReactNode, useEffect, useContext } from 'react';
import { addressService, type CreateAddressData } from '../services/addressService';
import { ToastContext } from './ToastContext';
import { AuthContext } from './AuthContext';

interface Address {
  id: number;
  address_type: 'apartment' | 'house';
  address_full: string;
  postal_code: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  phone: string;
  is_default: boolean;
}

interface AddressContextType {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  refreshAddresses: () => Promise<void>;
  addAddress: (data: CreateAddressData) => Promise<boolean>;
  updateAddress: (id: number, data: Partial<CreateAddressData>) => Promise<boolean>;
  removeAddress: (id: number) => Promise<boolean>;
}

export const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastContext = useContext(ToastContext);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      setError(null);
    } catch (err) {
      setAddresses([]);
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addAddress = useCallback(async (data: CreateAddressData) => {
    try {
      const newAddress = await addressService.createAddress(data);
      setAddresses(prev => [...prev, newAddress]);
      toastContext?.showToast('Адрес добавлен', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить адрес';
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const updateAddress = useCallback(async (id: number, data: Partial<CreateAddressData>) => {
    try {
      const updatedAddress = await addressService.updateAddress(id, data);
      setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr));
      toastContext?.showToast('Адрес обновлён', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить адрес';
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  const removeAddress = useCallback(async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toastContext?.showToast('Адрес удалён', 'info');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить адрес';
      toastContext?.showToast(message, 'error');
      return false;
    }
  }, [toastContext]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  return (
    <AddressContext.Provider value={{ 
      addresses, 
      loading, 
      error, 
      refreshAddresses,
      addAddress,
      updateAddress,
      removeAddress,
    }}>
      {children}
    </AddressContext.Provider>
  );
}
