import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
    />
  );
}