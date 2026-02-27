import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import './ProductCard.css';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Button } from '../ui/Button/Button';
import { IconButton } from '../ui/IconButton/IconButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const cartItem = cart?.items.find(item => item.product_id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;
  const canAddMore = product.stock - inCartQuantity;

  const wishlistItem = wishlist?.items.find(item => item.product_id === product.id);
  const isInWishlist = !!wishlistItem;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product.id, 1);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      await removeFromWishlist(wishlistItem.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="product-link">
        <div className="product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-placeholder">Нет фото</div>
          )}
          <IconButton
            className={`favorite-btn ${isInWishlist ? 'favorite-active' : ''}`}
            onClick={handleToggleFavorite}
            aria-label={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {isInWishlist ? '♥' : '♡'}
          </IconButton>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-footer">
            <span className="product-price">${product.price}</span>
            <span className="product-stock">
              {product.stock > 0
                ? `В наличии: ${product.stock}`
                : 'Нет в наличии'}
            </span>
          </div>
        </div>
      </Link>
      <Button
        variant="primary"
        size="medium"
        fullWidth
        onClick={handleAddToCart}
        disabled={canAddMore <= 0}
      >
        {canAddMore > 0
          ? 'В корзину'
          : inCartQuantity > 0
            ? `В корзине (${inCartQuantity})`
            : 'Нет в наличии'}
      </Button>
    </div>
  );
}