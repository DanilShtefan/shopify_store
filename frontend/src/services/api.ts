const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Получение CSRF токена из cookie
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { requireAuth?: boolean },
  requireAuth: boolean = false
): Promise<T> {
  const csrfToken = getCsrfToken();

  // Формируем заголовки
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Добавляем CSRF токен для безопасных методов
  if (csrfToken && options?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    headers['X-CSRFToken'] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Важно для отправки cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));

    // Если токен 401 — пробуем обновить токен (опционально)
    if (response.status === 401 && requireAuth) {
      console.warn('Token expired or invalid');
    }

    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}