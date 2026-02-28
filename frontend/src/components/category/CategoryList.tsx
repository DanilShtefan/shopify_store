import { useCategory } from '../../hooks/useCategory';
import { useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, FileText, Package, ChevronDown } from 'lucide-react';
import './CategoryList.css';

export function CategoryList() {
  const { categories, selectedCategory, selectCategory, loading } = useCategory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryListRef.current && !categoryListRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="category-list category-list_loading">
        <div className="category-skeleton">Загрузка категорий...</div>
      </div>
    );
  }

  const handleCategoryClick = (slug: string | null, hasChildren: boolean) => {
    // Если есть дочерние элементы - разворачиваем/сворачиваем
    if (hasChildren) {
      setExpandedCategory(expandedCategory === slug ? null : slug);
    }
    // Всегда выбираем категорию
    selectCategory(slug);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="category-list" ref={categoryListRef}>
      {/* Заголовок с кнопкой раскрытия */}
      <button className="category-list-header" onClick={toggleExpand}>
        <span className="category-header-text">
          <FolderOpen size={22} strokeWidth={2} />
          <span>Категории</span>
        </span>
        <ChevronDown 
          size={24} 
          strokeWidth={2} 
          className={`category-toggle-icon ${isExpanded ? 'category-toggle-expanded' : ''}`} 
        />
      </button>

      {/* Список категорий (показываем только если раскрыт) */}
      <div className={`category-list-content ${isExpanded ? 'show' : ''}`}>
        <button
          className={`category-item ${selectedCategory === null ? 'category-item-active' : ''}`}
          onClick={() => selectCategory(null)}
        >
          <Package size={20} strokeWidth={2} />
          <span className="category-name">Все товары</span>
        </button>

        {categories.map((category) => {
          const hasChildren = !!(category.children && category.children.length > 0);
          const isCategoryExpanded = expandedCategory === category.slug;
          const isActive = selectedCategory === category.slug;

          return (
            <div key={category.id} className="category-group">
              <button
                className={`category-item ${isActive ? 'category-item-active' : ''}`}
                onClick={() => handleCategoryClick(category.slug, hasChildren)}
              >
                {isCategoryExpanded ? (
                  <FolderOpen size={20} strokeWidth={2} />
                ) : (
                  <Folder size={20} strokeWidth={2} />
                )}
                <span className="category-name">{category.name}</span>
                {category.products_count !== undefined && (
                  <span className="category-count">{category.products_count}</span>
                )}
                {hasChildren && (
                  <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className={`category-arrow-icon ${isCategoryExpanded ? 'category-arrow-expanded' : ''}`}
                  />
                )}
              </button>

              {/* Дочерние категории */}
              {hasChildren && category.children && (
                <div className={`category-children ${isCategoryExpanded ? 'show' : ''}`}>
                  {category.children.map((child) => (
                    <button
                      key={child.id}
                      className={`category-item category-item-child ${selectedCategory === child.slug ? 'category-item-active' : ''}`}
                      onClick={() => selectCategory(child.slug)}
                    >
                      <FileText size={18} strokeWidth={2} />
                      <span className="category-name">{child.name}</span>
                      {child.products_count !== undefined && (
                        <span className="category-count">{child.products_count}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
