import { ProductList } from '../../components/product/ProductList';
import { ProductCardSkeleton } from '../../components/product/ProductCardSkeleton';
import { CategoryList } from '../../components/category/CategoryList';
import { useProducts } from '../../hooks/useProducts';
import { useCategory } from '../../hooks/useCategory';
import './Products.css';

export function Products() {
  const { selectedCategory, categories, selectCategory } = useCategory();
  const { products, loading } = useProducts(selectedCategory || undefined);

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

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-layout">
          <div className="products-sidebar">
            <CategoryList />
          </div>
          <div className="products-content">
            <div className="products-header">
              <h1>{currentCategoryName}</h1>
            </div>
            <div className="product-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <ProductList products={products} />
          {products.length === 0 && (
            <div className="no-products">
              <p>📭</p>
              <p>В этой категории пока нет товаров</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}