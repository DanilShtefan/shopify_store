import { useState, useEffect, useCallback } from 'react';
import { productService, type ProductListParams, type ProductDetailResponse } from '../services/productService';
import type { Product } from '../types/product';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalPages: number;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProducts(categorySlug?: string, perPage: number = 12): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params: ProductListParams = {
        categorySlug,
        page: pageNum,
        per_page: perPage,
      };
      
      const data = await productService.getAllProducts(params);
      
      setProducts(prev => reset ? data.products : [...prev, ...data.products]);
      setTotalPages(data.total_pages);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, perPage]);

  // Initial load + category change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(1, true);
  }, [categorySlug]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loading || page >= totalPages) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchProducts(nextPage, false);
  }, [loading, page, totalPages, fetchProducts]);

  // Refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    setPage(1);
    await fetchProducts(1, true);
  }, [fetchProducts]);

  const hasMore = page < totalPages;

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    totalPages,
    total,
    loadMore,
    refresh,
  };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await productService.getProductBySlug(slug);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return { product, loading, error };
}