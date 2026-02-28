import { Routes, Route } from 'react-router-dom';
import { Products } from './pages/Products/Products';
import { ProductDetail } from './pages/ProductDetail/ProductDetail';
import { Cart } from './pages/Cart/Cart';
import { Wishlist } from './pages/Wishlist/Wishlist';
import { Profile } from './pages/Profile/Profile';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import './styles/index.css';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ui/ErrorFallback/ErrorFallback';
import { Layout } from './components/loyout/Layout/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Products /></ErrorBoundary>} />
        <Route path="/products/:slug" element={<ErrorBoundary FallbackComponent={ErrorFallback}><ProductDetail /></ErrorBoundary>} />
        <Route path="/cart" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Cart /></ErrorBoundary>} />
        <Route path="/wishlist" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Wishlist /></ErrorBoundary>} />
        <Route path="/profile" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Profile /></ErrorBoundary>} />
        <Route path="/login" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Login /></ErrorBoundary>} />
        <Route path="/register" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Register /></ErrorBoundary>} />
      </Routes>
    </Layout>
  );
}

export default App;