import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearch } from '../../../hooks/useSearch';
import './SearchInputMobile.css';

export function SearchInputMobile() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [displayContent, setDisplayContent] = useState<React.ReactNode>(null);
  const prevResultsLengthRef = useRef<number>(-1);
  const prevResultsIdsRef = useRef<Array<string | number> | null>(null);
  const { results, loading, search, clearResults } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const MAX_HEIGHT = 400;

  const handleClose = useCallback(() => {
    prevResultsLengthRef.current = -1;
    prevResultsIdsRef.current = null;
    setTimeout(() => {
      setIsExpanded(false);
      setInputValue('');
      setHasSearched(false);
    }, 350);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isExpanded && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        handleClose();
        clearResults();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, clearResults, handleClose]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded || !hasSearched) {
      return;
    }

    // Проверяем, изменились ли результаты (по ID)
    const currentIds = results.map(r => r.id);
    const idsChanged = prevResultsIdsRef.current === null ||
                       currentIds.length !== prevResultsIdsRef.current.length ||
                       currentIds.some((id, i) => id !== prevResultsIdsRef.current![i]);

    if (idsChanged) {
      // Обновляем контент только если изменились результаты
      if (loading) {
        setDisplayContent(<div className="search-loading">Поиск...</div>);
      } else if (results.length === 0) {
        setDisplayContent(<div className="search-empty">Ничего не найдено</div>);
      } else {
        setDisplayContent(
          <ul className="search-list">
            {results.map((product) => (
              <li key={product.id} className="search-item">
                <Link to={`/products/${product.slug}`} className="search-item-link" onClick={handleClose}>
                  <div className="search-item-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="search-item-placeholder">Нет фото</div>
                    )}
                  </div>
                  <div className="search-item-info">
                    <span className="search-item-name">{product.name}</span>
                    <span className="search-item-price">${product.price}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        );
      }
      if (!loading) {
        prevResultsIdsRef.current = currentIds;
      }
    }

    prevResultsLengthRef.current = results.length;
  }, [results, loading, isExpanded, hasSearched]);

  // Обновляем высоту после рендера контента
  useEffect(() => {
    if (!isExpanded || !hasSearched) {
      setContentHeight(0);
      setHasScroll(false);
      return;
    }
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const newHeight = contentRef.current.scrollHeight;
        const finalHeight = Math.min(newHeight, MAX_HEIGHT);
        setContentHeight(finalHeight);
        setHasScroll(newHeight > MAX_HEIGHT);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [displayContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim().length > 0) {
      setHasSearched(true);
      search(value);
    } else {
      clearResults();
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const shouldRenderResults = isExpanded && hasSearched;

  return (
    <div className="search-mobile-wrapper" ref={wrapperRef}>
      <button
        className={`search-mobile-btn ${isExpanded ? 'hidden' : ''}`}
        onClick={handleExpand}
        aria-label="Поиск"
      >
        <Search size={22} strokeWidth={2} />
      </button>

      <div className={`search-mobile-input-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <div className="search-mobile-logo">🛒 Shopify Store</div>
        <div className="search-mobile-input-container">
          <input
            ref={inputRef}
            type="text"
            className="search-mobile-input"
            placeholder="Поиск товаров..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {shouldRenderResults && (
          <div
            className={`search-mobile-results ${contentHeight > 0 ? 'visible' : ''} ${hasScroll ? 'show-scroll' : ''}`}
            style={{ height: contentHeight || 'auto' }}
          >
            <div ref={contentRef} className="search-mobile-results-content">
              {displayContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
