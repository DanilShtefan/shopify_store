import { Link } from 'react-router-dom';
import './Header.css';
import { useCart } from '../../hooks/useCart';

export function Header() {
  const { cart } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🛒 Shopify Store
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Товары</Link>
          <Link to="/cart" className="nav-link">
            Корзина
            {cart && cart.items_count > 0 && (
              <span className="cart-badge">{cart.items_count}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}