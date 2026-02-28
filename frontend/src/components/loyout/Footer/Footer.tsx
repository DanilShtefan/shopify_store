import { memo } from 'react';
import './Footer.css';

export const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2026 Shopify Store. Все права защищены.</p>
      </div>
    </footer>
  );
});