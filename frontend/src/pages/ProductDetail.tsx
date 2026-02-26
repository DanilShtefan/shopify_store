import { useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import './ProductDetail.css';
import { useCart } from '../hooks/useCart';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug ?? '');
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, 1);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
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
      <BackButton />

      <div className="product-detail-content">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="image-placeholder">Нет фото</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">${product.price}</p>
          <p className="product-stock">
            {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
          </p>
          <p className="product-description">{product.description}</p>

          <Button
            variant="primary"
            size="large"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </div>
      </div>
    </div>
  );
}