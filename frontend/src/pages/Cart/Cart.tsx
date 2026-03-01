import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import './Cart.css';
import { IconButton } from '../../components/ui/IconButton/IconButton';
import { Button } from '../../components/ui/Button/Button';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { useCart } from '../../hooks/useCart';
import { useState, useEffect } from 'react';

export function Cart() {
  const {
    cart,
    loading,
    error,
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateItem,
    removeItem,
    getSelectedItemsTotal,
    getSelectedItemsCount,
  } = useCart();
  
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = async (itemId: number) => {
    setRemovingId(itemId);
    await new Promise(resolve => setTimeout(resolve, 300));
    await removeItem(itemId);
    setRemovingId(null);
  };

  const allSelected = cart && selectedItems.size === cart.items.length;
  const selectedTotal = getSelectedItemsTotal();
  const selectedCount = getSelectedItemsCount();

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

  if (error) {
    return (
      <div className="error">
        <p>Ошибка: {error}</p>
        <BackButton />
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
      <div className="cart-header">
        <h1>Корзина</h1>
        <div className="cart-selection-controls">
          <Button
            variant="outline"
            size="small"
            onClick={allSelected ? deselectAllItems : selectAllItems}
          >
            {allSelected ? 'Снять выделение' : 'Выбрать все'}
          </Button>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <div
                key={item.id}
                className={`cart-item ${removingId === item.id ? 'cart-item-removing' : ''} ${isSelected ? 'cart-item-selected' : ''}`}
              >
                <div className="cart-item-select">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.id)}
                    aria-label={isSelected ? 'Снять выделение' : 'Выделить товар'}
                  />
                </div>

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
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Итого</h2>
          
          {selectedItems.size > 0 ? (
            <>
              <div className="summary-row">
                <span>Выбрано товаров ({selectedCount} шт):</span>
                <span className="selected-total">${selectedTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Всего товаров ({cart.items_count} шт):</span>
                <span>${cart.total}</span>
              </div>
              <div className="summary-total">
                <span>К оплате:</span>
                <span className="total-amount">${selectedTotal.toFixed(2)}</span>
              </div>
              <Link
                to={{
                  pathname: '/checkout',
                  search: selectedItems.size > 0 ? `?items=${Array.from(selectedItems).join(',')}` : undefined,
                }}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={selectedItems.size === 0}
                >
                  <ShoppingBag size={20} />
                  Оформить выбранные ({selectedCount} шт.)
                </Button>
              </Link>
            </>
          ) : (
            <>
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
                  <ShoppingBag size={20} />
                  Оформить все товары
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
