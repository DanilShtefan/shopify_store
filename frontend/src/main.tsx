import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ui/ErrorFallback/ErrorFallback';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      >
        <ToastProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);