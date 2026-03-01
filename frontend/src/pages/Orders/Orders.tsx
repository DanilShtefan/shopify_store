import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { orderService, type Order } from '../../services/orderService';
import { PageLoader } from '../../components/ui/PageLoader/PageLoader';
import { Button } from '../../components/ui/Button/Button';
import { Package, Calendar, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';
import './Orders.css';

const statusIcons: Record<string, React.ReactNode> = {
  'Ожидает подтверждения': <Clock size={16} />,
  'Подтверждён': <CheckCircle size={16} />,
  'В обработке': <Package size={16} />,
  'Отправлен': <Truck size={16} />,
  'Доставлен': <CheckCircle size={16} />,
  'Отменён': <Clock size={16} />,
};

const statusColors: Record<string, string> = {
  'Ожидает подтверждения': '#f59e0b',
  'Подтверждён': '#10b981',
  'В обработке': '#667eea',
  'Отправлен': '#3b82f6',
  'Доставлен': '#10b981',
  'Отменён': '#ef4444',
};

export function Orders() {
  const authContext = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authContext?.isAuthenticated) {
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authContext?.isAuthenticated]);

  if (!authContext?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="orders-container">
      <div className="orders-card">
        <h1 className="orders-title">
          <Package size={28} />
          Мои заказы
        </h1>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <Package size={64} />
            <h2>У вас пока нет заказов</h2>
            <p>Оформите первый заказ в нашем магазине</p>
            <Link to="/">
              <Button variant="primary" size="medium">
                В каталог
              </Button>
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.order_number}`}
                className="order-card-link"
              >
                <div className="order-card">
                  <div className="order-card-header">
                    <div className="order-number">
                      <Package size={18} />
                      <span>#{order.order_number}</span>
                    </div>
                    <div
                      className="order-status-badge"
                      style={{
                        backgroundColor: `${statusColors[order.status]}20`,
                        color: statusColors[order.status],
                      }}
                    >
                      {statusIcons[order.status]}
                      <span>{order.status}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-date">
                      <Calendar size={14} />
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

                    <div className="order-items-count">
                      <Package size={14} />
                      <span>{order.items_count} {getDeclension(order.items_count, ['товар', 'товара', 'товаров'])}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span>Сумма:</span>
                      <strong>{order.total} ₽</strong>
                    </div>
                    <ChevronRight size={20} className="order-arrow" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getDeclension(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}
