import { useState } from 'react';
import { useAddress } from '../../../hooks/useAddress';
import { AddressForm } from '../AddressForm/AddressForm';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Skeleton } from '../Skeleton/Skeleton';
import { MapPin, Home, Phone, Mail, Edit, Trash2, Plus } from 'lucide-react';
import './Addresses.css';

interface AddressFormData {
  name: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postal_code: string;
  phone: string;
}

export function Addresses() {
  const { addresses, loading, addAddress, updateAddress, removeAddress } = useAddress();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAdd = async (data: AddressFormData) => {
    const success = await addAddress(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: number, data: AddressFormData) => {
    const success = await updateAddress(id, data);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены что хотите удалить этот адрес?')) {
      await removeAddress(id);
    }
  };

  if (loading) {
    return (
      <div className="addresses-section">
        <div className="addresses-header">
          <h2 className="addresses-title">
            <Home size={20} />
            Адреса доставки
          </h2>
        </div>
        <div className="addresses-list">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="address-item-skeleton">
              <Skeleton variant="rectangular" height="20px" width="100%" />
              <Skeleton variant="rectangular" height="16px" width="80%" />
              <Skeleton variant="rectangular" height="16px" width="60%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="addresses-section">
      <div className="addresses-header">
        <h2 className="addresses-title">
          <Home size={20} />
          Адреса доставки
        </h2>
        {!isAdding && (
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsAdding(true)}
            className="add-address-btn"
          >
            <Plus size={16} />
            Добавить адрес
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="address-form-container">
          <AddressForm
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {addresses.length === 0 && !isAdding ? (
        <div className="addresses-empty">
          <MapPin size={48} strokeWidth={1.5} className="addresses-empty-icon" />
          <p>У вас пока нет сохранённых адресов</p>
          <p>Добавьте адрес для удобного оформления заказов</p>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map((address) => (
            <div key={address.id} className="address-item">
              {editingId === address.id ? (
                <AddressForm
                  initialData={{
                    name: address.name,
                    city: address.city,
                    street: address.street,
                    house: address.house,
                    apartment: address.apartment,
                    postal_code: address.postal_code,
                    phone: address.phone,
                  }}
                  onSubmit={(data) => handleUpdate(address.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="address-item-header">
                    <div className="address-name-wrapper">
                      <MapPin size={16} className="address-name-icon" />
                      <h3>{address.name}</h3>
                    </div>
                    {address.is_default && (
                      <span className="address-badge">По умолчанию</span>
                    )}
                  </div>
                  <div className="address-item-content">
                    <p className="address-line">
                      <Home size={14} />
                      {address.city}, {address.street}, {address.house}
                      {address.apartment && `, ${address.apartment}`}
                    </p>
                    {address.postal_code && (
                      <p className="address-line">
                        <Mail size={14} />
                        Индекс: {address.postal_code}
                      </p>
                    )}
                    <p className="address-line">
                      <Phone size={14} />
                      {address.phone}
                    </p>
                  </div>
                  <div className="address-item-actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setEditingId(address.id)}
                      className="edit-btn"
                    >
                      <Edit size={14} />
                      Редактировать
                    </Button>
                    <IconButton
                      variant="danger"
                      onClick={() => handleDelete(address.id)}
                      aria-label="Удалить адрес"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
