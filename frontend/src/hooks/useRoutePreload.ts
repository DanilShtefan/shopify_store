import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Хук для предзагрузки соседних маршрутов
 * Когда пользователь находится на странице, предзагружаем вероятные следующие страницы
 */
export const useRoutePreload = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Предзагрузка в зависимости от текущего маршрута
    if (pathname === '/') {
      // С главной preload товаров и категорий
      import('../pages/Products/Products').catch(() => {});
      import('../pages/ProductDetail/ProductDetail').catch(() => {});
    } else if (pathname.startsWith('/products/')) {
      // Со страницы товара preload корзины
      import('../pages/Cart/Cart').catch(() => {});
    } else if (pathname === '/cart') {
      // Из корзины preload профиля
      import('../pages/Profile/Profile').catch(() => {});
    }
  }, [location.pathname]);
};
