import { useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import './ProductDetail.css';
import { useCart } from '../../hooks/useCart';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import { Button } from '../../components/ui/Button/Button';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { cart, addToCart } = useCart();
  const { product, loading, error } = useProduct(slug ?? '');

  const cartItem = product ? cart?.items.find(item => item.product_id === product.id) : undefined;
  const inCartQuantity = cartItem?.quantity || 0;
  const canAddMore = product ? product.stock - inCartQuantity : 0;

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, 1);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
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
            disabled={canAddMore <= 0}
          >
            {canAddMore > 0
              ? 'В корзину'
              : inCartQuantity > 0
                ? `В корзине (${inCartQuantity})`
                : 'Нет в наличии'}
          </Button>
        </div>
      </div>
    </div>
  );
}