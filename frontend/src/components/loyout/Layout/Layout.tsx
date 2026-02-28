
import { memo } from 'react';
import { Footer } from '../Footer/Footer';
import { Header } from '../Header/Header';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = memo(function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
});