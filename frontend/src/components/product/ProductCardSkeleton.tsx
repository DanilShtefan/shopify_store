import { Skeleton } from '../ui/Skeleton/Skeleton';
import './ProductCardSkeleton.css';

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <Skeleton variant="rectangular" height="200px" className="skeleton-image" />
      <div className="skeleton-info">
        <Skeleton height="24px" className="skeleton-name" />
        <Skeleton height="16px" className="skeleton-description" />
        <Skeleton height="16px" className="skeleton-description" />
        <div className="skeleton-footer">
          <Skeleton width="80px" height="24px" className="skeleton-price" />
          <Skeleton width="60px" height="20px" className="skeleton-stock" />
        </div>
      </div>
      <Skeleton height="44px" className="skeleton-button" />
    </div>
  );
}