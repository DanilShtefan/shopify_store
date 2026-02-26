import { Routes, Route } from 'react-router-dom';
import { Products } from './pages/Products/Products';
import { ProductDetail } from './pages/ProductDetail/ProductDetail';
import { Cart } from './pages/Cart/Cart';
import './styles/index.css';
import { Layout } from './components/loyout/Layout';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ui/ErrorFallback/ErrorFallback';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Products /></ErrorBoundary>} />
        <Route path="/products/:slug" element={<ErrorBoundary FallbackComponent={ErrorFallback}><ProductDetail /></ErrorBoundary>} />
        <Route path="/cart" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Cart /></ErrorBoundary>} />
      </Routes>
    </Layout>
  );
}

export default App;