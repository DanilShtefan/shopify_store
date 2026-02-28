const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Функция для получения access токена из localStorage
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  requireAuth: boolean = false
): Promise<T> {
  const accessToken = getAccessToken();
  
  // Формируем заголовки
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Если требуется авторизация и есть токен — добавляем в заголовок
  if (requireAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // Если токено 401 — пробуем обновить токен (опционально)
    if (response.status === 401 && requireAuth) {
      // Здесь можно добавить логику обновления токена
      console.warn('Token expired or invalid');
    }
    
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}