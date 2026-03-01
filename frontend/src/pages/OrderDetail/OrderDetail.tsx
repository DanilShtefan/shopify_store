import { useState, useEffect, useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { orderService, type OrderDetail } from '../../services/orderService';
import { PageLoader } from '../../components/ui/PageLoader/PageLoader';
import { Button } from '../../components/ui/Button/Button';
import { Package, Calendar, MapPin, Phone, Mail, MessageSquare, CheckCircle, Clock, Truck } from 'lucide-react';
import './OrderDetail.css';

const statusIcons: Record<string, React.ReactNode> = {
  'Ожидает подтверждения': <Clock size={20} />,
  'Подтверждён': <CheckCircle size={20} />,
  'В обработке': <Package size={20} />,
  'Отправлен': <Truck size={20} />,
  'Доставлен': <CheckCircle size={20} />,
  'Отменён': <Clock size={20} />,
};

const statusColors: Record<string, string> = {
  'Ожидает подтверждения': '#f59e0b',
  'Подтверждён': '#10b981',
  'В обработке': '#667eea',
  'Отправлен': '#3b82f6',
  'Доставлен': '#10b981',
  'Отменён': '#ef4444',
};

export function OrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const authContext = useContext(AuthContext);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authContext?.isAuthenticated) {
      return;
    }

    if (!orderNumber) {
      return;
    }

    const loadOrder = async () => {
      try {
        const data = await orderService.getOrderDetail(orderNumber);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError('Заказ не найден');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderNumber, authContext?.isAuthenticated]);

  if (!authContext?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <PageLoader />;
  }

  if (error || !order) {
    return (
      <div className="order-error">
        <Package size={64} />
        <h1>Заказ не найден</h1>
        <p>Заказ с номером {orderNumber} не существует</p>
        <Link to="/profile">
          <Button variant="primary" size="medium">
            В профиль
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-card">
        {/* Header */}
        <div className="order-detail-header">
          <div className="order-number-wrapper">
            <Package size={24} />
            <h1>Заказ #{order.order_number}</h1>
          </div>
          <div
            className="order-status"
            style={{
              backgroundColor: `${statusColors[order.status]}20`,
              color: statusColors[order.status],
            }}
          >
            {statusIcons[order.status]}
            <span>{order.status}</span>
          </div>
        </div>

        {/* Дата заказа */}
        <div className="order-date">
          <Calendar size={16} />
          <span>
            {new Date(order.created_at).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Товары */}
        <div className="order-section">
          <h2 className="order-section-title">
            <Package size={18} />
            Товары
          </h2>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.product_id} className="order-item">
                <div className="order-item-info">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="item-name"
                  >
                    {item.product_name}
                  </Link>
                  <p className="item-details">
                    {item.quantity} шт. × {item.price} ₽
                  </p>
                </div>
                <p className="item-subtotal">{item.subtotal} ₽</p>
              </div>
            ))}
          </div>
        </div>

        {/* Адрес доставки */}
        <div className="order-section">
          <h2 className="order-section-title">
            <MapPin size={18} />
            Адрес доставки
          </h2>
          <div className="order-address">
            {order.shipping_address}
          </div>
        </div>

        {/* Контакты */}
        <div className="order-section">
          <h2 className="order-section-title">
            <Phone size={18} />
            Контактная информация
          </h2>
          <div className="order-contacts">
            <p className="contact-row">
              <Mail size={16} />
              {order.email}
            </p>
            <p className="contact-row">
              <Phone size={16} />
              {order.phone}
            </p>
            {order.comment && (
              <p className="contact-row">
                <MessageSquare size={16} />
                <strong>Комментарий:</strong> {order.comment}
              </p>
            )}
          </div>
        </div>

        {/* Итого */}
        <div className="order-totals">
          <div className="total-row">
            <span>Товары ({order.items.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
            <span>{order.subtotal} ₽</span>
          </div>
          {order.shipping_cost !== '0.00' && (
            <div className="total-row">
              <span>Доставка</span>
              <span>{order.shipping_cost} ₽</span>
            </div>
          )}
          <div className="total-row total-row-grand">
            <span>Итого</span>
            <span>{order.total} ₽</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="order-actions">
          <Link to="/profile">
            <Button variant="outline" size="medium">
              В профиль
            </Button>
          </Link>
          <Link to="/">
            <Button variant="primary" size="medium">
              В каталог
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
