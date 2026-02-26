import { ProductCard } from './ProductCard';
import type { Product } from '../../types/product';
import './ProductList.css'

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
    if(products.length === 0) {
        return <div>Товары не найдены</div>;
    }

    return <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
}