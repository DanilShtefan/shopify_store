import { fetchApi } from './api';

export interface Address {
  id: number;
  name: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
}

export interface CreateAddressData {
  name: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postal_code?: string;
  phone: string;
  is_default?: boolean;
}

export const addressService = {
  // Получить все адреса
  getAddresses: () => fetchApi<Address[]>('/addresses/'),

  // Создать новый адрес
  createAddress: (data: CreateAddressData) =>
    fetchApi<Address>('/addresses/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Обновить адрес
  updateAddress: (id: number, data: Partial<CreateAddressData>) =>
    fetchApi<Address>(`/addresses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Удалить адрес
  deleteAddress: (id: number) =>
    fetchApi(`/addresses/${id}/delete/`, {
      method: 'DELETE',
    }),
};
