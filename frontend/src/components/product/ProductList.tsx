import { ProductCard } from './ProductCard';
import type { Product } from '../../types/product';
import './ProductList.css'

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
    return <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
}