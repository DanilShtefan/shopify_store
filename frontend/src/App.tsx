import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { PageLoader } from './components/ui/PageLoader/PageLoader';
import { ErrorFallback } from './components/ui/ErrorFallback/ErrorFallback';
import { Layout } from './components/loyout/Layout/Layout';
import { useRoutePreload } from './hooks/useRoutePreload';
import './styles/index.css';

// Lazy loading страниц - Code Splitting
// Используем then() для преобразования именованных экспортов в default
const Products = lazy(() => import('./pages/Products/Products').then(module => ({ default: module.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail').then(module => ({ default: module.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart/Cart').then(module => ({ default: module.Cart })));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist').then(module => ({ default: module.Wishlist })));
const Profile = lazy(() => import('./pages/Profile/Profile').then(module => ({ default: module.Profile })));
const Login = lazy(() => import('./pages/Auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(module => ({ default: module.Register })));

// Обёртка для ленивой загрузки с ErrorBoundary и Suspense
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

function App() {
  // Хук для предзагрузки соседних маршрутов
  useRoutePreload();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LazyRoute><Products /></LazyRoute>} />
        <Route path="/products/:slug" element={<LazyRoute><ProductDetail /></LazyRoute>} />
        <Route path="/cart" element={<LazyRoute><Cart /></LazyRoute>} />
        <Route path="/wishlist" element={<LazyRoute><Wishlist /></LazyRoute>} />
        <Route path="/profile" element={<LazyRoute><Profile /></LazyRoute>} />
        <Route path="/login" element={<LazyRoute><Login /></LazyRoute>} />
        <Route path="/register" element={<LazyRoute><Register /></LazyRoute>} />
      </Routes>
    </Layout>
  );
}

export default App;