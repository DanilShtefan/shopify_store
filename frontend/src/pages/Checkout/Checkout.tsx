import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useAddress } from '../../hooks/useAddress';
import { orderService } from '../../services/orderService';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox';
import { PageLoader } from '../../components/ui/PageLoader/PageLoader';
import { CheckCircle, AlertCircle, Package, MapPin, Phone, Mail } from 'lucide-react';
import './Checkout.css';

export function Checkout() {
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const { addresses, loading: addressesLoading } = useAddress();
  const navigate = useNavigate();

  const cart = cartContext?.cart;
  const removeSelectedItems = cartContext?.removeSelectedItems;
  const selectedItems = cartContext?.selectedItems;

  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    total: string;
  } | null>(null);

  // Проверка авторизации
  useEffect(() => {
    if (!authContext?.isAuthenticated) {
      navigate('/login');
    }
  }, [authContext?.isAuthenticated, navigate]);

  // Предзаполнение данных пользователя
  useEffect(() => {
    if (authContext?.user) {
      setFormData(prev => ({
        ...prev,
        email: authContext.user?.email || '',
        phone: '',
      }));
    }
  }, [authContext?.user]);

  // Выбор адреса по умолчанию
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.is_default);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Если корзина пуста или нет выбранных товаров - редирект
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAddressId) {
      newErrors.address = 'Выберите адрес доставки';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (!/^\+?[\d\s()-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный телефон';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!cart || cart.items.length === 0) return;

    setLoading(true);

    try {
      const orderData = {
        address_id: selectedAddressId!,
        phone: formData.phone,
        email: formData.email,
        comment: formData.comment,
        items: cart.items
          .filter(item => selectedItems?.has(item.id))
          .map((item: { product_id: number; quantity: number }) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
      };

      const response = await orderService.createOrder(orderData);

      setOrderSuccess({
        orderNumber: response.order_number,
        total: response.total,
      });

      // Очищаем только выбранные товары из корзины
      await removeSelectedItems?.();

      // Через 3 секунды редирект на страницу заказа
      setTimeout(() => {
        navigate(`/orders/${response.order_number}`);
      }, 3000);
    } catch (error) {
      let errorMessage = 'Ошибка при оформлении заказа';

      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (typeof errorData === 'object') {
            const firstKey = Object.keys(errorData)[0];
            errorMessage = errorData[firstKey];
          } else {
            errorMessage = errorData.detail || error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      setErrors({ _general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (id: number) => {
    setSelectedAddressId(id);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address;
      return newErrors;
    });
  };

  // Показываем успешный заказ
  if (orderSuccess) {
    return (
      <div className="checkout-container">
        <div className="checkout-success">
          <CheckCircle size={64} className="success-icon" />
          <h1 className="success-title">Заказ оформлен!</h1>
          <p className="success-text">
            Ваш заказ <strong>#{orderSuccess.orderNumber}</strong> успешно оформлен
          </p>
          <p className="success-total">
            Сумма заказа: <strong>{orderSuccess.total} ₽</strong>
          </p>
          <div className="success-actions">
            <Link to={`/orders/${orderSuccess.orderNumber}`}>
              <Button variant="primary" size="medium">
                Подробнее о заказе
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="medium">
                В каталог
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Загрузка
  if (addressesLoading || !cart) {
    return <PageLoader />;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        {/* Левая колонка - форма */}
        <div className="checkout-form-section">
          <h1 className="checkout-title">Оформление заказа</h1>

          <form onSubmit={handleSubmit}>
            {/* Адрес доставки */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">
                <MapPin size={20} />
                Адрес доставки
              </h2>

              {addresses.length === 0 ? (
                <div className="no-addresses">
                  <AlertCircle size={40} />
                  <p>У вас нет сохранённых адресов</p>
                  <Link to="/profile">
                    <Button variant="outline" size="small">
                      Добавить адрес
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="addresses-list">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`address-card ${
                        selectedAddressId === address.id ? 'selected' : ''
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="address-card-header">
                        <h3>{address.address_full}</h3>
                        {address.is_default && (
                          <span className="badge">По умолчанию</span>
                        )}
                      </div>
                      <p className="address-card-content">
                        {address.city}, {address.street}, {address.house}
                        {address.apartment && `, ${address.apartment}`}
                      </p>
                      <p className="address-card-phone">
                        <Phone size={14} />
                        {address.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {errors.address && (
                <p className="field-error">{errors.address}</p>
              )}
            </div>

            {/* Контакты */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">
                <Phone size={20} />
                Контактная информация
              </h2>

              <div className="form-row">
                <Input
                  label="Телефон"
                  type="tel"
                  placeholder="+7 999 123-45-67"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  error={errors.phone}
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Email"
                  type="email"
                  placeholder="example@test.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors.email}
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <label className="comment-label">
                  <Mail size={16} />
                  Комментарий к заказу
                </label>
                <textarea
                  className="comment-textarea"
                  placeholder="Пожелания к доставке, время звонка и т.д."
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>

            {/* Общая ошибка */}
            {errors._general && (
              <div className="general-error">
                <AlertCircle size={20} />
                <span>{errors._general}</span>
              </div>
            )}

            {/* Кнопка оформления */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading || addresses.length === 0}
            >
              {loading ? 'Оформление...' : `Оформить заказ (${cart.total} ₽)`}
            </Button>
          </form>
        </div>

        {/* Правая колонка - заказ */}
        <div className="checkout-order-section">
          <div className="order-summary">
            <div className="order-summary-header">
              <h2 className="order-summary-title">
                <Package size={20} />
                Ваш заказ
              </h2>
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  if (cart && selectedItems?.size === cart.items.length) {
                    cart.items.forEach(item => cartContext?.toggleItemSelection(item.id));
                  } else {
                    cartContext?.selectAllItems?.();
                  }
                }}
              >
                {cart && selectedItems?.size === cart.items.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>

            <div className="order-items">
              {cart.items.map((item: { id: number; product_id: number; product_name: string; quantity: number; price: string; subtotal: string }) => {
                const isSelected = selectedItems?.has(item.id);
                return (
                  <div key={item.id} className="order-item">
                    <div className="order-item-top">
                      <Checkbox
                        checked={isSelected || false}
                        onChange={() => cartContext?.toggleItemSelection(item.id)}
                      />
                      <p className="item-subtotal">{item.subtotal} ₽</p>
                    </div>
                    <div className="order-item-info">
                      <h4>{item.product_name}</h4>
                      <p className="item-quantity">
                        {item.quantity} шт. × {item.price} ₽
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Товары ({cart.items.filter(item => selectedItems?.has(item.id)).reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                <span>{cart.items.filter(item => selectedItems?.has(item.id)).reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2)} ₽</span>
              </div>
              <div className="total-row">
                <span>Доставка</span>
                <span>Бесплатно</span>
              </div>
              <div className="total-row total-row-grand">
                <span>Итого</span>
                <span>{cart.items.filter(item => selectedItems?.has(item.id)).reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2)} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
