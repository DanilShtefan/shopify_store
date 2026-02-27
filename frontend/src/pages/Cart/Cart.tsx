import { Link } from 'react-router-dom';
import './Cart.css';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton';
import { IconButton } from '../../components/ui/IconButton/IconButton';
import { Button } from '../../components/ui/Button/Button';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { useCart } from '../../hooks/useCart';

export function Cart() {
  const { cart, loading, error, updateItem, removeItem } = useCart();

  if (error) {
    return (
      <div className="error">
        <p>Ошибка: {error}</p>
        <BackButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <div className="cart-content">
          <div className="cart-items">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cart-item-skeleton">
                <Skeleton variant="rectangular" width="100px" height="100px" />
                <div className="cart-item-info-skeleton">
                  <Skeleton height="20px" width="200px" />
                  <Skeleton height="16px" width="80px" />
                </div>
                <Skeleton height="32px" width="100px" />
                <Skeleton height="24px" width="80px" />
                <Skeleton height="32px" width="32px" />
              </div>
            ))}
          </div>
          <div className="cart-summary-skeleton">
            <Skeleton height="32px" width="150px" />
            <Skeleton height="20px" width="100%" />
            <Skeleton height="20px" width="100%" />
            <Skeleton height="48px" width="100%" />
          </div>
        </div>
      </div>
    );
  }

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
            <div key={item.id} className="cart-item">
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
                    onClick={() => removeItem(item.id)}
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
          <Button variant="primary" size="large" fullWidth>
            Оформить заказ
          </Button>
        </div>
      </div>
    </div>
  );
}