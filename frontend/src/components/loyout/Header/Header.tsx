import { Link } from 'react-router-dom';
import './Header.css';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { useAuth } from '../../../hooks/useAuth';
import { LogoutButton } from '../../ui/LogoutButton/LogoutButton';
import { SearchInput } from '../../ui/SearchInput/SearchInput';

export function Header() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🛒 Shopify Store
        </Link>
        <div className="header-bottom">
          <SearchInput />
          <nav className="nav">
            <Link to="/" className="nav-link" title="Товары">
              <span className="nav-icon">📦</span>
              <span className="nav-text">Товары</span>
            </Link>
            <Link to="/wishlist" className="nav-link" title="Избранное">
              <span className="nav-icon">❤️</span>
              <span className="nav-text">Избранное</span>
              {wishlist && wishlist.items_count > 0 && (
                <span className="cart-badge">{wishlist.items_count}</span>
              )}
            </Link>
            <Link to="/cart" className="nav-link" title="Корзина">
              <span className="nav-icon">🛒</span>
              <span className="nav-text">Корзина</span>
              {cart && cart.items_count > 0 && (
                <span className="cart-badge">{cart.items_count}</span>
              )}
            </Link>

            {/* Авторизация */}
            {isAuthenticated ? (
              <div className="auth-wrapper">
                <div className="user-info">
                  <span className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span className="user-name">{user?.username}</span>
                </div>
                <LogoutButton onClick={logout}>
                  Выход
                </LogoutButton>
              </div>
            ) : (
              <Link to="/login" className="nav-link" title="Вход">
                <span className="nav-icon">👤</span>
                <span className="nav-text">Вход</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}