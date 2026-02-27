import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../../hooks/useSearch';
import './SearchInputMobile.css';

export function SearchInputMobile() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { results, loading, search, clearResults } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isExpanded && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setInputValue('');
        clearResults();
        setHasSearched(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, clearResults]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim().length > 0) {
      setHasSearched(true);
      search(value);
    } else {
      setHasSearched(false);
      clearResults();
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setInputValue('');
    clearResults();
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const showResults = isExpanded && hasSearched;

  return (
    <div className="search-mobile-wrapper" ref={wrapperRef}>
      <button
        className={`search-mobile-btn ${isExpanded ? 'hidden' : ''}`}
        onClick={handleExpand}
        aria-label="Поиск"
      >
        🔍
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

        {showResults && (
          <div className="search-mobile-results visible">
            {loading ? (
              <div className="search-loading">Поиск...</div>
            ) : results.length === 0 ? (
              <div className="search-empty">Ничего не найдено</div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
