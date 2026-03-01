import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, ShoppingCart, User } from 'lucide-react';
import './Header.css';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { useAuth } from '../../../hooks/useAuth';
import { SearchInput } from '../../ui/SearchInput/SearchInput';

export const Header = memo(function Header() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <ShoppingCart size={24} strokeWidth={2} />
          <span>Shopify Store</span>
        </Link>
        <div className="header-bottom">
          <SearchInput />
          <nav className="nav">
            <Link to="/" className="nav-link" title="Товары">
              <Package size={20} strokeWidth={2} />
              <span className="nav-text">Товары</span>
            </Link>
            {isAuthenticated === true && (
              <Link to="/orders" className="nav-link" title="Заказы">
                <Package size={20} strokeWidth={2} />
                <span className="nav-text">Заказы</span>
              </Link>
            )}
            <Link to="/wishlist" className="nav-link" title="Избранное">
              <Heart size={20} strokeWidth={2} />
              <span className="nav-text">Избранное</span>
              <span className={`cart-badge ${wishlist && wishlist.items_count > 0 ? 'badge-visible' : 'badge-hidden'}`}>
                {wishlist?.items_count || ''}
              </span>
            </Link>
            <Link to="/cart" className="nav-link" title="Корзина">
              <ShoppingCart size={20} strokeWidth={2} />
              <span className="nav-text">Корзина</span>
              <span className={`cart-badge ${cart && cart.items_count > 0 ? 'badge-visible' : 'badge-hidden'}`}>
                {cart?.items_count || ''}
              </span>
            </Link>

            {/* Авторизация */}
            {isAuthenticated ? (
              <Link to="/profile" className="user-info-link">
                <div className="user-info">
                  <span className="user-avatar">
                    <User size={18} strokeWidth={2} />
                  </span>
                  <span className="user-name">{user?.username}</span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="nav-link" title="Вход">
                <User size={20} strokeWidth={2} />
                <span className="nav-text">Вход</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
});