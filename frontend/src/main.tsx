import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CategoryProvider } from './context/CategoryContext.tsx';
import './styles/index.css';

// Получаем CSRF токен при загрузке приложения
async function initApp() {
  try {
    await fetch('http://127.0.0.1:8000/api/auth/csrf/', {
      credentials: 'include',
    });
  } catch (error) {
    console.warn('Failed to get CSRF token:', error);
  }
}

initApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CategoryProvider>
              <CartProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </CartProvider>
            </CategoryProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
});