import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import './ProductDetail.css';
import { useCart } from '../../hooks/useCart';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { Button } from '../../components/ui/Button/Button';

// Мемоизированный компонент кнопки
const AddToCartButton = memo(function AddToCartButton({ product }: { product: any }) {
  const { cart, addToCart } = useCart();

  const cartItem = cart?.items.find(item => item.product_id === product.id);
  const inCartQuantity = cartItem?.quantity || 0;
  const canAddMore = product.stock - inCartQuantity;

  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
  };

  return (
    <Button
      variant="primary"
      size="large"
      onClick={handleAddToCart}
      disabled={canAddMore <= 0}
    >
      {canAddMore > 0
        ? 'В корзину'
        : inCartQuantity > 0
          ? `В корзине (${inCartQuantity})`
          : 'Нет в наличии'}
    </Button>
  );
});

export const ProductDetail = memo(function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug ?? '');

  const images = product && product.images && product.images.length > 0
    ? product.images
    : [{ id: 0, url: product?.image ?? '', is_main: true }];

  const handleThumbnailClick = (index: number) => {
    const element = document.getElementById(`product-image-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Показываем загрузку только если товара ещё не было
  if (loading && !product) {
    return (
      <div className="product-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error">
        <p>Товар не найден</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-back">
        <BackButton />
      </div>

      <div className="product-detail-content">
        <div className="product-detail-gallery">
          <div className="product-thumbnails">
            {images.map((img, index: number) => (
              <button
                key={img.id ?? index}
                className={`thumbnail ${img.is_main ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img src={img.url} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="product-detail-images">
            {images.map((img, index: number) => (
              <div
                key={img.id ?? index}
                id={`product-image-${index}`}
                className="product-image-item"
              >
                <img src={img.url} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">${product.price}</p>
          <p className="product-stock">
            {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
          </p>
          <p className="product-description">{product.description}</p>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
});