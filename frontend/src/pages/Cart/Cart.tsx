import { Link } from 'react-router-dom';
import './Cart.css';
import { IconButton } from '../../components/ui/IconButton/IconButton';
import { Button } from '../../components/ui/Button/Button';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { useCart } from '../../hooks/useCart';
import { useState, useEffect } from 'react';

export function Cart() {
  const { cart, loading, error, updateItem, removeItem } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Скролл наверх сразу при монтировании
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = async (itemId: number) => {
    setRemovingId(itemId);
    // Ждём завершения анимации (300ms) перед удалением
    await new Promise(resolve => setTimeout(resolve, 300));
    await removeItem(itemId);
    setRemovingId(null);
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку если есть
  if (error) {
    return (
      <div className="error">
        <p>Ошибка: {error}</p>
        <BackButton />
      </div>
    );
  }

  // Показываем пустое состояние
  if (!cart || cart.items.length === 0) {
    return (
        <div>
            <BackButton />
            <div className="cart-empty">
                <h1>Корзина пуста</h1>
                <p>Добавьте товары чтобы оформить заказ</p>
            </div>
        </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div 
              key={item.id} 
              className={`cart-item ${removingId === item.id ? 'cart-item-removing' : ''}`}
            >
              <div className="cart-item-image">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} />
                ) : (
                  <div className="image-placeholder">Нет фото</div>
                )}
              </div>

              <div className="cart-item-content">
                <div className="cart-item-info">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="cart-item-name"
                  >
                    {item.product_name}
                  </Link>
                  <p className="cart-item-price">${item.price}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="cart-item-quantity">
                    <IconButton
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </IconButton>
                    <span className="quantity-value">{item.quantity}</span>
                    <IconButton
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product_stock}
                    >
                      +
                    </IconButton>
                  </div>

                  <div className="cart-item-subtotal">
                    ${item.subtotal}
                  </div>

                  <IconButton
                    variant="danger"
                    onClick={() => handleRemove(item.id)}
                    className="remove-btn"
                  >
                    ✕
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Итого</h2>
          <div className="summary-row">
            <span>Товары ({cart.items_count} шт):</span>
            <span>${cart.total}</span>
          </div>
          <div className="summary-total">
            <span>Общая сумма:</span>
            <span>${cart.total}</span>
          </div>
          <Link to="/checkout" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="large" fullWidth>
              Оформить заказ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}