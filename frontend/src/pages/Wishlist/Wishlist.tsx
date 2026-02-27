import { Link } from 'react-router-dom';
import './Wishlist.css';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton';
import { IconButton } from '../../components/ui/IconButton/IconButton';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { useWishlist } from '../../hooks/useWishlist';

export function Wishlist() {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();

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
      <div className="wishlist-page">
        <h1>Избранное</h1>
        <div className="wishlist-items">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="wishlist-item-skeleton">
              <Skeleton variant="rectangular" width="100px" height="100px" />
              <div className="wishlist-item-info-skeleton">
                <Skeleton height="20px" width="200px" />
                <Skeleton height="16px" width="80px" />
              </div>
              <Skeleton height="32px" width="32px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          <div key={item.id} className="wishlist-item">
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
              onClick={() => removeFromWishlist(item.id)}
            >
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}
