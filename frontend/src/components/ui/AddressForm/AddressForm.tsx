import { useState } from 'react';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { AddressAutocomplete } from '../AddressAutocomplete/AddressAutocomplete';
import './AddressForm.css';

interface AddressFormData {
  address_type: 'apartment' | 'house';
  address_full: string;
  postal_code: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  phone: string;
}

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    address_type: initialData?.address_type || 'apartment',
    address_full: initialData?.address_full || '',
    postal_code: initialData?.postal_code || '',
    city: initialData?.city || '',
    street: initialData?.street || '',
    house: initialData?.house || '',
    apartment: initialData?.apartment || '',
    phone: initialData?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  const validate = () => {
    const newErrors: Partial<AddressFormData> = {};
    
    if (!formData.address_full) {
      newErrors.address_full = 'Введите адрес';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Введите телефон';
    }
    
    // Для квартиры обязательна квартира/офис
    if (formData.address_type === 'apartment' && !formData.apartment) {
      newErrors.apartment = 'Введите номер квартиры';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleChange = (field: keyof AddressFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressSelect = (address: {
    city: string;
    street: string;
    house: string;
    postal_code: string;
    apartment: string;
  }) => {
    const address_full = `${address.city}, ${address.street}, ${address.house}${address.apartment ? ', кв ' + address.apartment : ''}`;
    
    setFormData(prev => ({
      ...prev,
      address_full,
      city: address.city,
      street: address.street,
      house: address.house,
      postal_code: address.postal_code,
      // Квартира заполняется только для квартир
      apartment: isApartment ? (address.apartment || '') : '',
    }));
    
    // Очищаем ошибки
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address_full;
      delete newErrors.city;
      delete newErrors.street;
      delete newErrors.house;
      return newErrors;
    });
  };

  const isApartment = formData.address_type === 'apartment';
  const isHouse = formData.address_type === 'house';

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      {/* Переключатель типа адреса */}
      <div className="address-type-selector">
        <label className={`address-type-option ${isApartment ? 'selected' : ''}`}>
          <input
            type="radio"
            name="address_type"
            value="apartment"
            checked={isApartment}
            onChange={() => setFormData(prev => ({ ...prev, address_type: 'apartment', apartment: '' }))}
            disabled={loading}
          />
          <span className="address-type-label">🏢 Квартира</span>
        </label>
        
        <label className={`address-type-option ${isHouse ? 'selected' : ''}`}>
          <input
            type="radio"
            name="address_type"
            value="house"
            checked={isHouse}
            onChange={() => setFormData(prev => ({ ...prev, address_type: 'house', apartment: '' }))}
            disabled={loading}
          />
          <span className="address-type-label">🏡 Частный дом</span>
        </label>
      </div>

      <div className="address-form-row">
        <label className="address-form-label">
          Адрес
        </label>
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          placeholder="Начните вводить адрес (город, улица...)"
          disabled={loading}
          addressType={formData.address_type}
        />
        {errors.address_full && (
          <p className="address-form-error">{errors.address_full}</p>
        )}
      </div>

      {/* Поля для квартиры */}
      {isApartment && (
        <div className="address-form-row address-form-row-inline">
          <Input
            label="Город"
            type="text"
            value={formData.city}
            disabled
            className="input-readonly"
          />
          <Input
            label="Улица"
            type="text"
            value={formData.street}
            disabled
            className="input-readonly"
          />
        </div>
      )}

      {/* Поля для частного дома */}
      {isHouse && (
        <div className="address-form-row address-form-row-inline">
          <Input
            label="Город"
            type="text"
            value={formData.city}
            disabled
            className="input-readonly"
          />
          <Input
            label="Улица"
            type="text"
            value={formData.street}
            disabled
            className="input-readonly"
          />
        </div>
      )}

      <div className="address-form-row address-form-row-inline">
        <Input
          label="Дом"
          type="text"
          value={formData.house}
          disabled
          className="input-readonly"
        />
        {isApartment && (
          <Input
            label="Квартира"
            type="text"
            value={formData.apartment}
            onChange={handleChange('apartment')}
            disabled={loading || true}
            className="input-readonly"
          />
        )}
        <Input
          label="Индекс"
          type="text"
          value={formData.postal_code}
          disabled
          className="input-readonly"
        />
      </div>

      <div className="address-form-row">
        <Input
          label="Телефон"
          type="tel"
          placeholder="+7 999 123-45-67"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          disabled={loading}
        />
      </div>

      <div className="address-form-actions">
        <Button
          type="button"
          variant="outline"
          size="medium"
          onClick={onCancel}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          disabled={loading}
        >
          {loading ? 'Сохранение...' : (initialData ? 'Обновить' : 'Добавить')}
        </Button>
      </div>
    </form>
  );
}
