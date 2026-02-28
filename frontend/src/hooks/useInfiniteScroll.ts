import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Хук для бесконечного скролла на основе Intersection Observer
 * @param options - настройки хука
 * @returns ref для элемента-триггера
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 0.5,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Не создаём observer если нет больше данных или идёт загрузка
    if (!hasMore || loading) {
      cleanup();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return cleanup;
  }, [hasMore, loading, onLoadMore, threshold, rootMargin, cleanup]);

  return sentinelRef;
}
