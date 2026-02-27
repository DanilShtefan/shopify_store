import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import './ProductCard.css';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Button } from '../ui/Button/Button';
import { IconButton } from '../ui/IconButton/IconButton';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const cartItem = cart?.items.find(item => item.product_id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;
  const canAddMore = product.stock - inCartQuantity;

  const wishlistItem = wishlist?.items.find(item => item.product_id === product.id);
  const isInWishlist = !!wishlistItem;

  const images = product.images.length > 0 ? product.images : [{ id: 0, url: product.image, is_main: true }];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
          {images[currentImageIndex]?.url ? (
            <img src={images[currentImageIndex].url} alt={product.name} />
          ) : (
            <div className="product-placeholder">Нет фото</div>
          )}
          {images.length > 1 && (
            <>
              <IconButton className="image-nav-btn image-nav-prev" onClick={handlePrevImage}>
                ‹
              </IconButton>
              <IconButton className="image-nav-btn image-nav-next" onClick={handleNextImage}>
                ›
              </IconButton>
              <div className="image-indicators">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </>
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