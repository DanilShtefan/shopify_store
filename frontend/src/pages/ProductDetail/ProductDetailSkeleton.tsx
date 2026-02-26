import { Skeleton } from '../../components/ui/Skeleton/Skeleton';
import { BackButton } from '../../components/ui/BackButton/BackButton';
import './ProductDetailSkeleton.css';

export function ProductDetailSkeleton() {
  return (
    <div className="product-detail">
      <BackButton />

      <div className="product-detail-content">
        <div className="product-detail-image-skeleton">
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>

        <div className="product-detail-info-skeleton">
          <Skeleton height="40px" width="80%" />
          <Skeleton height="32px" width="40%" />
          <Skeleton height="20px" width="60%" />
          <Skeleton height="60px" width="100%" />
          <Skeleton height="50px" width="100%" />
        </div>
      </div>
    </div>
  );
}