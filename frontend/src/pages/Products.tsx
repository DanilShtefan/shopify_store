import { ProductList } from '../components/product/ProductList';
import { ProductCardSkeleton } from '../components/product/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';

export function Products() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="products-page">
        <h1>Все товары</h1>
        <div className="product-list">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1>Все товары</h1>
      <ProductList products={products} />
    </div>
  );
}