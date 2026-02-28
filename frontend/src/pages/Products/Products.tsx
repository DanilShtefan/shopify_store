import { ProductList } from '../../components/product/ProductList';
import { ProductCardSkeleton } from '../../components/product/ProductCardSkeleton';
import { CategoryList } from '../../components/category/CategoryList';
import { useProducts } from '../../hooks/useProducts';
import { useCategory } from '../../hooks/useCategory';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { LoadMore } from '../../components/ui/LoadMore/LoadMore';
import './Products.css';

export function Products() {
  const { selectedCategory, categories, selectCategory } = useCategory();
  const { products, loading, loadingMore, hasMore, loadMore } = useProducts(selectedCategory || undefined, 12);

  // Находим название выбранной категории
  const getCategoryName = (slug: string | null) => {
    if (!slug) return 'Все товары';

    // Ищем в корневых категориях
    const rootCategory = categories.find(cat => cat.slug === slug);
    if (rootCategory) return rootCategory.name;

    // Ищем в дочерних
    for (const cat of categories) {
      const child = cat.children?.find(child => child.slug === slug);
      if (child) return `${cat.name} → ${child.name}`;
    }

    return 'Категория';
  };

  const currentCategoryName = getCategoryName(selectedCategory);

  // Infinite scroll
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore,
  });

  return (
    <div className="products-page">
      <div className="products-layout">
        <div className="products-sidebar">
          <CategoryList />
        </div>
        <div className="products-content">
          <div className="products-header">
            <h1>{currentCategoryName}</h1>
            {selectedCategory && (
              <button className="clear-filter-btn" onClick={() => selectCategory(null)}>
                <span>✕</span> Сбросить фильтр
              </button>
            )}
          </div>

          {loading && products.length === 0 ? (
            <div className="product-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>📭</p>
              <p>В этой категории пока нет товаров</p>
            </div>
          ) : (
            <>
              <ProductList products={products} />
              {loadingMore && (
                <div className="product-list-loading">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}
              <div ref={sentinelRef}>
                <LoadMore loading={loadingMore} hasMore={hasMore} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}