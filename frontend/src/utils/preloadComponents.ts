/**
 * Утилита для preload критических чанков
 * Предзагружает указанные модули когда браузер простаивает
 */

export const preloadComponent = (importFn: () => Promise<unknown>) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(() => {
        // Игнорируем ошибки preload
      });
    });
  } else {
    // Fallback для браузеров без requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {
        // Игнорируем ошибки preload
      });
    }, 0);
  }
};

/**
 * Preload для критических страниц приложения
 */
export const preloadCriticalRoutes = () => {
  // Главная страница - всегда приоритет
  preloadComponent(() => import('../pages/Products/Products'));
  
  // Страница товара - вторая по важности
  preloadComponent(() => import('../pages/ProductDetail/ProductDetail'));
  
  // Корзина - предзагружаем после основной страницы
  preloadComponent(() => import('../pages/Cart/Cart'));
};
