import './LoadMore.css';

interface LoadMoreProps {
  loading?: boolean;
  hasMore?: boolean;
}

export const LoadMore = ({ loading = false, hasMore = true }: LoadMoreProps) => {
  // Скрываем всё когда нет больше данных
  if (!hasMore) {
    return null;
  }

  // Невидимый sentinel элемент для Intersection Observer
  return (
    <div className="load-more load-more-sentinel">
      {loading && <div className="load-more-loading-indicator"></div>}
    </div>
  );
};
