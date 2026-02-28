import { Link } from 'react-router-dom';
import './Wishlist.css';
import { IconButton } from '../../components/ui/IconButton/IconButton';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { useWishlist } from '../../hooks/useWishlist';
import { useState, useEffect } from 'react';

export function Wishlist() {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Скролл наверх сразу при монтировании
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = async (itemId: number) => {
    setRemovingId(itemId);
    // Ждём завершения анимации (300ms) перед удалением
    await new Promise(resolve => setTimeout(resolve, 300));
    await removeFromWishlist(itemId);
    setRemovingId(null);
  };

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className="wishlist-page">
        <h1>Избранное</h1>
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
  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div>
        <BackButton />
        <div className="wishlist-empty">
          <h1>Избранное пусто</h1>
          <p>Добавьте товары в избранное чтобы увидеть их здесь</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>Избранное</h1>

      <div className="wishlist-items">
        {wishlist.items.map((item) => (
          <div 
            key={item.id} 
            className={`wishlist-item ${removingId === item.id ? 'wishlist-item-removing' : ''}`}
          >
            <div className="wishlist-item-image">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name} />
              ) : (
                <div className="image-placeholder">Нет фото</div>
              )}
            </div>

            <div className="wishlist-item-info">
              <Link
                to={`/products/${item.product_slug}`}
                className="wishlist-item-name"
              >
                {item.product_name}
              </Link>
              <p className="wishlist-item-price">${item.product_price}</p>
              <p className="wishlist-item-stock">
                {item.product_stock > 0
                  ? `В наличии: ${item.product_stock}`
                  : 'Нет в наличии'}
              </p>
            </div>

            <IconButton
              variant="danger"
              onClick={() => handleRemove(item.id)}
            >
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}
