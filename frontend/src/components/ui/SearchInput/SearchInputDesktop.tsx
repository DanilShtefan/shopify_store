import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearch } from '../../../hooks/useSearch';
import { Skeleton } from '../Skeleton/Skeleton';
import './SearchInputDesktop.css';

export function SearchInputDesktop() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [displayContent, setDisplayContent] = useState<React.ReactNode>(null);
  const prevResultsLengthRef = useRef<number>(-1);
  const prevResultsIdsRef = useRef<Array<string | number> | null>(null);
  const { results, loading, search, clearResults } = useSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        handleClose();
        clearResults();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearResults]);

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
        setDisplayContent(
          <ul className="search-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="search-item search-item-skeleton">
                <Skeleton variant="rectangular" width={60} height={60} className="skeleton-image" />
                <div className="search-item-info">
                  <Skeleton variant="text" className="skeleton-name" />
                  <Skeleton variant="text" width={80} className="skeleton-price" />
                </div>
              </li>
            ))}
          </ul>
        );
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

  // Измеряем высоту контента для плавной анимации
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!isExpanded || !hasSearched) {
      setContentHeight(0);
      setHasScroll(false);
      return;
    }
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      const finalHeight = Math.min(newHeight, MAX_HEIGHT);
      setContentHeight(finalHeight);
      setHasScroll(newHeight > MAX_HEIGHT);
    }
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
    <div className="search-desktop-wrapper" ref={wrapperRef}>
      {!isExpanded && (
        <button
          className="search-desktop-btn"
          onClick={handleExpand}
          aria-label="Поиск"
        >
          <Search size={22} strokeWidth={2} />
        </button>
      )}

      <div className={`search-desktop-input-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <div className="search-desktop-input-container">
          <input
            ref={inputRef}
            type="text"
            className="search-desktop-input"
            placeholder="Поиск товаров..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {shouldRenderResults && (
          <div
            className={`search-desktop-results ${contentHeight > 0 ? 'show' : ''} ${hasScroll ? 'show-scroll' : ''}`}
            style={{ height: contentHeight || 'auto' }}
          >
            <div ref={contentRef} className="search-desktop-results-content">
              {displayContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
