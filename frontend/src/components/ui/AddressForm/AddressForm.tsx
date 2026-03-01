import { useState } from 'react';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import './AddressForm.css';

interface AddressFormData {
  name: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postal_code: string;
  phone: string;
}

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    name: initialData?.name || '',
    city: initialData?.city || '',
    street: initialData?.street || '',
    house: initialData?.house || '',
    apartment: initialData?.apartment || '',
    postal_code: initialData?.postal_code || '',
    phone: initialData?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  const validate = () => {
    const newErrors: Partial<AddressFormData> = {};
    if (!formData.name) newErrors.name = 'Введите название';
    if (!formData.city) newErrors.city = 'Введите город';
    if (!formData.street) newErrors.street = 'Введите улицу';
    if (!formData.house) newErrors.house = 'Введите дом';
    if (!formData.phone) newErrors.phone = 'Введите телефон';
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

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <div className="address-form-row">
        <Input
          label="Название"
          type="text"
          placeholder="Дом, Работа, Дача"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={loading}
        />
      </div>

      <div className="address-form-row">
        <Input
          label="Город"
          type="text"
          placeholder="Москва"
          value={formData.city}
          onChange={handleChange('city')}
          error={errors.city}
          disabled={loading}
        />
      </div>

      <div className="address-form-row">
        <Input
          label="Улица"
          type="text"
          placeholder="ул. Пушкина"
          value={formData.street}
          onChange={handleChange('street')}
          error={errors.street}
          disabled={loading}
        />
      </div>

      <div className="address-form-row address-form-row-inline">
        <Input
          label="Дом"
          type="text"
          placeholder="10"
          value={formData.house}
          onChange={handleChange('house')}
          error={errors.house}
          disabled={loading}
        />
        <Input
          label="Квартира"
          type="text"
          placeholder="25"
          value={formData.apartment}
          onChange={handleChange('apartment')}
          disabled={loading}
        />
        <Input
          label="Индекс"
          type="text"
          placeholder="101000"
          value={formData.postal_code}
          onChange={handleChange('postal_code')}
          disabled={loading}
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
